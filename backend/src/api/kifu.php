<?php
require_once __DIR__ . '/../models/Kifu.php';

header('Content-Type: application/json');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$kifuModel = new Kifu();

$currentUserId = $_SESSION['user_id'] ?? null;

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    if ($action === 'save') {
        if (!$currentUserId) {
            http_response_code(401);
            echo json_encode(['error' => 'Login required']);
            exit;
        }

        try {
            $id = $data['id'] ?? null;
            $title = $data['title'] ?? 'Untitled';
            $kifuText = $data['kifu_text'] ?? '';
            $isPublic = $data['is_public'] ?? true;
            $senteName = $data['sente_name'] ?? '先手';
            $goteName = $data['gote_name'] ?? '後手';
            $initialBoardText = isset($data['initial_board']) ? json_encode($data['initial_board'], JSON_UNESCAPED_UNICODE) : null;

            if ($id) {
                $kifuModel->update($id, $currentUserId, $title, $kifuText, $isPublic, $senteName, $goteName, $initialBoardText);
                echo json_encode(['success' => true, 'id' => $id]);
            } else {
                $newId = $kifuModel->save($currentUserId, $title, $kifuText, $isPublic, $senteName, $goteName, $initialBoardText);
                echo json_encode(['success' => true, 'id' => $newId]);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    } elseif ($action === 'delete') {
        if (!$currentUserId) {
             http_response_code(401);
             echo json_encode(['error' => 'Login required']);
             exit;
        }
        $id = $data['id'] ?? null;
        if (!$id) {
             http_response_code(400);
             echo json_encode(['error' => 'ID required']);
             exit;
        }
        try {
            $kifuModel->delete($id, $currentUserId);
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
             http_response_code(500);
             echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }
} elseif ($method === 'GET') {
    if ($action === 'list') {
        $list = $kifuModel->getList($currentUserId);
        echo json_encode(['success' => true, 'data' => $list]);
    } elseif ($action === 'get') {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['error' => 'ID required']);
            exit;
        }
        $kifu = $kifuModel->get($id);
        if ($kifu) {
            if (!$kifu['is_public'] && $kifu['user_id'] !== $currentUserId) {
                 http_response_code(403);
                 echo json_encode(['error' => 'Private kifu']);
                 exit;
            }

            if (!empty($kifu['initial_board_text'])) {
                $kifu['initial_board'] = json_decode($kifu['initial_board_text'], true);
            }
            unset($kifu['initial_board_text']);

            echo json_encode(['success' => true, 'data' => $kifu]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Not found']);
        }
    }
}
