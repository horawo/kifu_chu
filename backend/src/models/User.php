<?php
require_once __DIR__ . '/../db/Database.php';

class User {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($username, $password) {
        // Validation
        if (!preg_match('/^[A-Za-z0-9_\.-]{3,30}$/', $username)) {
            throw new Exception("Invalid username format.");
        }
        if (strlen($password) < 8 || !preg_match('/^[A-Za-z0-9_\.-]+$/', $password)) {
             // Regex for password as per requirements: ~[A-Za-z_\.-]
             // Actually requirement says: ~[A-Za-z_\.\-] for 8+ chars.
             // Implied allowed chars: Alphanumeric + _ . -
             throw new Exception("Invalid password format. Must be 8+ chars, alphanumeric or _ . -");
        }

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        $userId = uniqid('user_', true);

        $stmt = $this->db->prepare("INSERT INTO t_user (user_id, username, password_hash) VALUES (:uid, :name, :pass)");
        try {
            $stmt->execute([
                ':uid' => $userId,
                ':name' => $username,
                ':pass' => $passwordHash
            ]);
            return $userId;
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) { // Duplicate entry
                throw new Exception("Username already exists.");
            }
            throw $e;
        }
    }

    public function findByUsername($username) {
        $stmt = $this->db->prepare("SELECT * FROM t_user WHERE username = :name");
        $stmt->execute([':name' => $username]);
        return $stmt->fetch();
    }
    
    public function findById($userId) {
        $stmt = $this->db->prepare("SELECT * FROM t_user WHERE user_id = :uid");
        $stmt->execute([':uid' => $userId]);
        return $stmt->fetch();
    }

    public function verifyPassword($user, $password) {
        return password_verify($password, $user['password_hash']);
    }
}
