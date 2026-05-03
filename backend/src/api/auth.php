<?php
require_once __DIR__ . '/../models/User.php';

header('Content-Type: application/json');

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

$userModel = new User();

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($action === 'register') {
        try {
            $username = $data['username'] ?? '';
            $password = $data['password'] ?? '';
            
            if (!$username || !$password) {
                throw new Exception("Username and password required.");
            }

            $userId = $userModel->create($username, $password);
            
            echo json_encode(['success' => true, 'user_id' => $userId]);
        } catch (Exception $e) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    } elseif ($action === 'login') {
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        $user = $userModel->findByUsername($username);

        if ($user && $userModel->verifyPassword($user, $password)) {
            if ($user['is_banned']) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'User is banned.']);
                exit;
            }

            $_SESSION['user_id'] = $user['user_id'];
            $_SESSION['username'] = $user['username'];
            
            echo json_encode(['success' => true, 'user' => [
                'user_id' => $user['user_id'],
                'username' => $user['username']
            ]]);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
        }
    } elseif ($action === 'logout') {
        session_destroy();
        echo json_encode(['success' => true]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Action not found']);
    }
} elseif ($method === 'GET') {
    if ($action === 'me') {
        if (isset($_SESSION['user_id'])) {
             echo json_encode(['is_logged_in' => true, 'user' => [
                'user_id' => $_SESSION['user_id'],
                'username' => $_SESSION['username']
            ]]);
        } else {
             echo json_encode(['is_logged_in' => false]);
        }
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Action not found']);
    }
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
