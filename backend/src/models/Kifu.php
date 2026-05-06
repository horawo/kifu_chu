<?php
require_once __DIR__ . '/../db/Database.php';

class Kifu {
    private $db;

    /**
     * Create the kifu model with a shared database connection.
     */
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Insert a text blob and return its primary key.
     */
    private function createBlob($text) {
        $stmt = $this->db->prepare("INSERT INTO t_kifu_blob (kifu_text) VALUES (:text)");
        $stmt->execute([':text' => $text]);
        return $this->db->lastInsertId();
    }

    /**
     * Update an existing text blob.
     */
    private function updateBlob($blobId, $text) {
        $stmt = $this->db->prepare("UPDATE t_kifu_blob SET kifu_text = :text WHERE id = :blobId");
        $stmt->execute([
            ':text' => $text,
            ':blobId' => $blobId
        ]);
    }

    /**
     * Save a new kifu with move text and an optional starting-board blob.
     */
    public function save($userId, $title, $kifuText, $isPublic, $senteName = '先手', $goteName = '後手', $initialBoardText = null) {
        try {
            $this->db->beginTransaction();

            $blobId = $this->createBlob($kifuText);
            $initialBlobId = $initialBoardText !== null && $initialBoardText !== '' ? $this->createBlob($initialBoardText) : null;

            $stmt = $this->db->prepare("
                INSERT INTO t_kifu (user_id, title, kifu_blob_id, initial_blob_id, is_public, sente_name, gote_name)
                VALUES (:uid, :title, :blobId, :initialBlobId, :isPublic, :sente, :gote)
            ");
            $stmt->execute([
                ':uid' => $userId,
                ':title' => $title,
                ':blobId' => $blobId,
                ':initialBlobId' => $initialBlobId,
                ':isPublic' => $isPublic ? 1 : 0,
                ':sente' => $senteName,
                ':gote' => $goteName
            ]);

            $kifuId = $this->db->lastInsertId();
            $this->db->commit();
            return $kifuId;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Update an existing kifu and keep its starting board in a separate blob.
     */
    public function update($id, $userId, $title, $kifuText, $isPublic, $senteName = '先手', $goteName = '後手', $initialBoardText = null) {
        $kifu = $this->get($id);
        if (!$kifu) throw new Exception("Kifu not found");
        if ($kifu['user_id'] !== $userId) throw new Exception("Unauthorized");

        try {
            $this->db->beginTransaction();

            $this->updateBlob($kifu['kifu_blob_id'], $kifuText);

            $initialBlobId = $kifu['initial_blob_id'] ?? null;
            if ($initialBoardText !== null && $initialBoardText !== '') {
                if ($initialBlobId) {
                    $this->updateBlob($initialBlobId, $initialBoardText);
                } else {
                    $initialBlobId = $this->createBlob($initialBoardText);
                }
            }

            $stmt = $this->db->prepare("
                UPDATE t_kifu
                SET title = :title,
                    initial_blob_id = :initialBlobId,
                    is_public = :isPublic,
                    sente_name = :sente,
                    gote_name = :gote,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = :id
            ");
            $stmt->execute([
                ':title' => $title,
                ':initialBlobId' => $initialBlobId,
                ':isPublic' => $isPublic ? 1 : 0,
                ':sente' => $senteName,
                ':gote' => $goteName,
                ':id' => $id
            ]);

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    /**
     * Return visible kifu metadata for list display.
     */
    public function getList($currentUserId = null) {
        $sql = "SELECT k.id as kifu_id, k.title as kifu_name, k.user_id, u.username, k.created_at as created, k.is_public, k.sente_name, k.gote_name
                FROM t_kifu k
                JOIN t_user u ON k.user_id = u.user_id
                WHERE k.is_public = 1";

        $params = [];
        if ($currentUserId) {
            $sql .= " OR k.user_id = :uid";
            $params[':uid'] = $currentUserId;
        }

        $sql .= " ORDER BY k.created_at DESC";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Return a single kifu with move text and optional starting-board text.
     */
    public function get($id) {
        $stmt = $this->db->prepare("
            SELECT k.*, u.username, b.kifu_text, ib.kifu_text AS initial_board_text
            FROM t_kifu k
            JOIN t_kifu_blob b ON k.kifu_blob_id = b.id
            LEFT JOIN t_kifu_blob ib ON k.initial_blob_id = ib.id
            JOIN t_user u ON k.user_id = u.user_id
            WHERE k.id = :id
        ");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    /**
     * Delete a kifu and both blobs owned by that kifu.
     */
    public function delete($id, $userId) {
        $kifu = $this->get($id);
        if (!$kifu) return false;
        if ($kifu['user_id'] !== $userId) throw new Exception("Unauthorized");

        $blobId = $kifu['kifu_blob_id'];
        $initialBlobId = $kifu['initial_blob_id'] ?? null;

        try {
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("DELETE FROM t_kifu WHERE id = :id");
            $stmt->execute([':id' => $id]);

            $stmtBlob = $this->db->prepare("DELETE FROM t_kifu_blob WHERE id = :id");
            $stmtBlob->execute([':id' => $blobId]);

            if ($initialBlobId) {
                $stmtBlob->execute([':id' => $initialBlobId]);
            }

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
