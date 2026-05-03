<?php

class Database {
    private static $instance = null;
    private $pdo;

    private function __construct() {
        $host = getenv('DB_HOST') ?: 'db';
        $db   = getenv('DB_NAME') ?: 'chushogi';
        $user = getenv('DB_USER') ?: 'user';
        $pass = getenv('DB_PASS') ?: 'password';
        $type = getenv('DB_TYPE') ?: 'mysql';

        try {
            if ($type === 'sqlite') {
                $path = __DIR__ . '/../../db/database.sqlite';
                $this->pdo = new PDO("sqlite:$path");
            } else {
                $dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";
                $this->pdo = new PDO($dsn, $user, $pass);
            }
            
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            // For security, do not output detailed connection errors in production
            error_log($e->getMessage());
            http_response_code(500);
            echo json_encode(['error' => 'Database connection failed']);
            exit;
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->pdo;
    }
}
