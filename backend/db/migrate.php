<?php
require_once __DIR__ . '/../src/db/Database.php';

try {
    $db = Database::getInstance();
    $pdo = $db->getConnection();
    
    echo "Running migrations...\n";
    
    $sqlFiles = glob(__DIR__ . '/migrations/*.sql');
    sort($sqlFiles);
    
    foreach ($sqlFiles as $sqlFile) {
        echo "Running migration: " . basename($sqlFile) . "\n";
        $sql = file_get_contents($sqlFile);
        
        // Split by semicolon and execute each statement
        $statements = array_filter(array_map('trim', explode(';', $sql)));
        
        foreach ($statements as $stmt) {
            if (empty($stmt)) continue;
            
            try {
                $pdo->exec($stmt);
                echo "  Executed: " . substr($stmt, 0, 50) . "...\n";
            } catch (PDOException $e) {
                echo "  Error or already applied: " . $e->getMessage() . "\n";
            }
        }
    }
    
    echo "Migration completed successfully!\n";
    
    // Insert test user
    echo "\nCreating test user...\n";
    $testUserId = 'testuser';
    $testUsername = 'Test User';
    $testPassword = password_hash('password123', PASSWORD_DEFAULT);
    
    $stmt = $pdo->prepare("INSERT IGNORE INTO t_user (user_id, username, password_hash) VALUES (?, ?, ?)");
    if ($stmt->execute([$testUserId, $testUsername, $testPassword])) {
        echo "Test user created: user_id='testuser', password='password123'\n";
    } else {
        echo "Test user already exists or creation failed\n";
    }
    
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
