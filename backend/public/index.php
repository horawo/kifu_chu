<?php
// CORS headers
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
// Allow local dev frontend
if ($origin === 'http://localhost:5173') {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Simple Router
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Route /api/auth -> src/api/auth.php
if (strpos($uri, '/api/auth') === 0) {
    require __DIR__ . '/../src/api/auth.php';
    exit;
}

// Logic for other APIs (to be implemented)
if (strpos($uri, '/api/kifu') === 0) {
    require __DIR__ . '/../src/api/kifu.php';
    exit;
}

if (strpos($uri, '/api/initial') === 0) {
    require __DIR__ . '/../src/api/initial.php';
    exit;
}

// Default 404
http_response_code(404);
echo json_encode(['error' => 'Not Found']);
