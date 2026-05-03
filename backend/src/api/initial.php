<?php
require_once __DIR__ . '/../models/Initial.php';
require_once __DIR__ . '/../middleware/auth.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

requireAuth();

$action = $_GET['action'] ?? '';
$userId = $_SESSION['user_id'];

try {
    switch ($action) {
        case 'list':
            $initials = Initial::getListByUserId($userId);
            echo json_encode(['success' => true, 'data' => $initials]);
            break;
            
        case 'get':
            $initialId = $_GET['initial_id'] ?? null;
            if (!$initialId) {
                throw new Exception('initial_id is required');
            }
            $initial = Initial::getById($initialId, $userId);
            if (!$initial) {
                throw new Exception('Initial setup not found');
            }
            echo json_encode(['success' => true, 'data' => $initial]);
            break;
            
        case 'save':
            $input = json_decode(file_get_contents('php://input'), true);
            if (!$input || !isset($input['initial_name']) || !isset($input['board'])) {
                throw new Exception('Missing required fields: initial_name, board');
            }
            $initialId = Initial::save($userId, $input);
            echo json_encode(['success' => true, 'initial_id' => $initialId]);
            break;
            
        case 'delete':
            $initialId = $_GET['initial_id'] ?? null;
            if (!$initialId) {
                throw new Exception('initial_id is required');
            }
            Initial::delete($initialId, $userId);
            echo json_encode(['success' => true]);
            break;
            
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
