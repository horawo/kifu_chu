<?php
require_once __DIR__ . '/../db/Database.php';

class Initial {
    /**
     * Get list of initial setups for a user
     */
    public static function getListByUserId($userId) {
        $db = Database::getInstance();
        $pdo = $db->getConnection();
        
        $stmt = $pdo->prepare("
            SELECT id as initial_id, title as initial_name, created_at as created, updated_at as updated
            FROM t_initial
            WHERE user_id = ?
            ORDER BY updated_at DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    /**
     * Get a specific initial setup by ID
     */
    public static function getById($initialId, $userId) {
        $db = Database::getInstance();
        $pdo = $db->getConnection();
        
        $stmt = $pdo->prepare("
            SELECT i.id as initial_id, i.title as initial_name, b.kifu_text as board_json, i.created_at as created, i.updated_at as updated
            FROM t_initial i
            JOIN t_kifu_blob b ON i.kifu_blob_id = b.id
            WHERE i.id = ? AND i.user_id = ?
        ");
        $stmt->execute([$initialId, $userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            $result['board'] = json_decode($result['board_json'], true);
            unset($result['board_json']);
        }
        
        return $result;
    }
    
    /**
     * Save (create or update) an initial setup
     */
    public static function save($userId, $data) {
        $db = Database::getInstance();
        $pdo = $db->getConnection();
        
        $pdo->beginTransaction();
        try {
            // Convert board to JSON
            $boardJson = json_encode($data['board']);
            
            if (isset($data['initial_id']) && $data['initial_id']) {
                // Update existing
                // Get existing kifu_blob_id
                $stmt = $pdo->prepare("SELECT kifu_blob_id FROM t_initial WHERE id = ? AND user_id = ?");
                $stmt->execute([$data['initial_id'], $userId]);
                $blobId = $stmt->fetchColumn();
                
                if (!$blobId) {
                    throw new Exception("Initial setup not found or access denied");
                }
                
                // Update blob
                $stmt = $pdo->prepare("UPDATE t_kifu_blob SET kifu_text = ? WHERE id = ?");
                $stmt->execute([$boardJson, $blobId]);
                
                // Update t_initial
                $stmt = $pdo->prepare("UPDATE t_initial SET title = ? WHERE id = ?");
                $stmt->execute([$data['initial_name'], $data['initial_id']]);
                
                $initialId = $data['initial_id'];
            } else {
                // Create new
                $stmt = $pdo->prepare("INSERT INTO t_kifu_blob (kifu_text) VALUES (?)");
                $stmt->execute([$boardJson]);
                $blobId = $pdo->lastInsertId();
                
                $stmt = $pdo->prepare("INSERT INTO t_initial (user_id, title, kifu_blob_id) VALUES (?, ?, ?)");
                $stmt->execute([$userId, $data['initial_name'], $blobId]);
                $initialId = $pdo->lastInsertId();
            }
            
            $pdo->commit();
            return $initialId;
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
    
    /**
     * Delete an initial setup
     */
    public static function delete($initialId, $userId) {
        $db = Database::getInstance();
        $pdo = $db->getConnection();
        
        $pdo->beginTransaction();
        try {
            // Verify ownership and get kifu_blob_id
            $stmt = $pdo->prepare("SELECT kifu_blob_id FROM t_initial WHERE id = ? AND user_id = ?");
            $stmt->execute([$initialId, $userId]);
            $blobId = $stmt->fetchColumn();
            
            if (!$blobId) {
                throw new Exception("Initial setup not found or access denied");
            }
            
            // Delete from t_initial first (FK constraint)
            $stmt = $pdo->prepare("DELETE FROM t_initial WHERE id = ?");
            $stmt->execute([$initialId]);
            
            // Delete from t_kifu_blob
            $stmt = $pdo->prepare("DELETE FROM t_kifu_blob WHERE id = ?");
            $stmt->execute([$blobId]);
            
            $pdo->commit();
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
    }
}
