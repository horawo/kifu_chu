<?php
require_once __DIR__ . '/../db/Database.php';

class User {
    private $db;

    /**
     * Create the user model with a shared database connection.
     */
    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    /**
     * Validate the login user ID used as the stable account key.
     */
    private function validateUserId($userId) {
        if (!preg_match('/^[A-Za-z0-9_\.-]{3,30}$/', $userId)) {
            throw new Exception("Invalid user ID format.");
        }
    }

    /**
     * Validate the display username shown in the application.
     */
    private function validateUsername($username) {
        $length = function_exists('mb_strlen') ? mb_strlen($username) : strlen($username);
        if ($length < 1 || $length > 50) {
            throw new Exception("Username must be between 1 and 50 characters.");
        }
    }

    /**
     * Validate password rules before hashing or updating credentials.
     */
    private function validatePassword($password) {
        if (strlen($password) < 8 || !preg_match('/^[A-Za-z0-9_\.-]+$/', $password)) {
            throw new Exception("Invalid password format. Must be 8+ chars, alphanumeric or _ . -");
        }
    }

    /**
     * Create a user where user_id is the login ID and username is the display name.
     */
    public function create($userId, $username, $password) {
        $this->validateUserId($userId);
        $this->validateUsername($username);
        $this->validatePassword($password);

        $passwordHash = password_hash($password, PASSWORD_DEFAULT);

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
                throw new Exception("User ID already exists.");
            }
            throw $e;
        }
    }

    /**
     * Find a user by the stable login user ID.
     */
    public function findById($userId) {
        $stmt = $this->db->prepare("SELECT * FROM t_user WHERE user_id = :uid");
        $stmt->execute([':uid' => $userId]);
        return $stmt->fetch();
    }

    /**
     * Verify a plain password against the stored password hash.
     */
    public function verifyPassword($user, $password) {
        return password_verify($password, $user['password_hash']);
    }

    /**
     * Update display username and, when provided, password for an existing user.
     */
    public function updateProfile($userId, $username, $password = null) {
        $this->validateUsername($username);

        if ($password !== null && $password !== '') {
            $this->validatePassword($password);
            $passwordHash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $this->db->prepare("UPDATE t_user SET username = :name, password_hash = :pass WHERE user_id = :uid");
            $stmt->execute([
                ':name' => $username,
                ':pass' => $passwordHash,
                ':uid' => $userId
            ]);
        } else {
            $stmt = $this->db->prepare("UPDATE t_user SET username = :name WHERE user_id = :uid");
            $stmt->execute([
                ':name' => $username,
                ':uid' => $userId
            ]);
        }

        return $this->findById($userId);
    }
}
