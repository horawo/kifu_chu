<?php
require_once __DIR__ . '/../db/Database.php';

class Kifu {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function save($userId, $title, $kifuText, $isPublic, $senteName = '先手', $goteName = '後手') {
        try {
            $this->db->beginTransaction();

            // Insert Blob
            $stmtBlob = $this->db->prepare("INSERT INTO t_kifu_blob (kifu_text) VALUES (:text)");
            $stmtBlob->execute([':text' => $kifuText]);
            $blobId = $this->db->lastInsertId();

            // Insert Meta
            $stmt = $this->db->prepare("INSERT INTO t_kifu (user_id, title, kifu_blob_id, is_public, sente_name, gote_name) VALUES (:uid, :title, :blobId, :isPublic, :sente, :gote)");
            $stmt->execute([
                ':uid' => $userId,
                ':title' => $title,
                ':blobId' => $blobId,
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

    public function update($id, $userId, $title, $kifuText, $isPublic, $senteName = '先手', $goteName = '後手') {
        $kifu = $this->get($id);
        if (!$kifu) throw new Exception("Kifu not found");
        if ($kifu['user_id'] !== $userId) throw new Exception("Unauthorized");

        try {
            $this->db->beginTransaction();

            // Update Blob
            $stmtBlob = $this->db->prepare("UPDATE t_kifu_blob SET kifu_text = :text WHERE id = :blobId");
            $stmtBlob->execute([
                ':text' => $kifuText,
                ':blobId' => $kifu['kifu_blob_id']
            ]);

            // Update Meta
            $stmt = $this->db->prepare("UPDATE t_kifu SET title = :title, is_public = :isPublic, sente_name = :sente, gote_name = :gote, updated_at = CURRENT_TIMESTAMP WHERE id = :id");
            $stmt->execute([
                ':title' => $title,
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

    public function getList($currentUserId = null) {
        // Show all public kifu AND my own private kifu
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

    public function get($id) {
        $stmt = $this->db->prepare("
            SELECT k.*, u.username, b.kifu_text 
            FROM t_kifu k
            JOIN t_kifu_blob b ON k.kifu_blob_id = b.id
            JOIN t_user u ON k.user_id = u.user_id
            WHERE k.id = :id
        ");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function delete($id, $userId) {
        $kifu = $this->get($id);
        if (!$kifu) return false;
        if ($kifu['user_id'] !== $userId) throw new Exception("Unauthorized");

        $blobId = $kifu['kifu_blob_id'];

        try {
            $this->db->beginTransaction();
            
            $stmt = $this->db->prepare("DELETE FROM t_kifu WHERE id = :id");
            $stmt->execute([':id' => $id]);

            $stmtBlob = $this->db->prepare("DELETE FROM t_kifu_blob WHERE id = :id");
            $stmtBlob->execute([':id' => $blobId]);

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }
}
