<?php
require_once __DIR__ . '/../db/Database.php';

class InitialSetup {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function save($userId, $title, $kifuText) {
        try {
            $this->db->beginTransaction();

            // Insert Blob
            $stmtBlob = $this->db->prepare("INSERT INTO t_kifu_blob (kifu_text) VALUES (:text)");
            $stmtBlob->execute([':text' => $kifuText]);
            $blobId = $this->db->lastInsertId();

            // Insert Meta
            $stmt = $this->db->prepare("INSERT INTO t_initial (user_id, title, kifu_blob_id) VALUES (:uid, :title, :blobId)");
            $stmt->execute([
                ':uid' => $userId,
                ':title' => $title,
                ':blobId' => $blobId
            ]);

            $id = $this->db->lastInsertId();
            $this->db->commit();
            return $id;
        } catch (Exception $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function getList($userId) {
        $stmt = $this->db->prepare("
            SELECT i.id, i.title, i.created_at 
            FROM t_initial i 
            WHERE i.user_id = :uid
            ORDER BY i.created_at DESC
        ");
        $stmt->execute([':uid' => $userId]);
        return $stmt->fetchAll();
    }

    public function get($id) {
        $stmt = $this->db->prepare("
            SELECT i.*, b.kifu_text 
            FROM t_initial i
            JOIN t_kifu_blob b ON i.kifu_blob_id = b.id
            WHERE i.id = :id
        ");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch();
    }

    public function delete($id, $userId) {
        $item = $this->get($id);
        if (!$item) return false;
        if ($item['user_id'] !== $userId) throw new Exception("Unauthorized");

        $blobId = $item['kifu_blob_id'];

        try {
            $this->db->beginTransaction();
            
            $stmt = $this->db->prepare("DELETE FROM t_initial WHERE id = :id");
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
