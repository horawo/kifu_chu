$base = "http://127.0.0.1:8080/api/auth"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

echo "1. Registering..."
$body = @{ username="testuser"; password="password123" } | ConvertTo-Json
try {
    $reg = Invoke-RestMethod -Uri "$base?action=register" -Method Post -Body $body -ContentType "application/json" -WebSession $session
    echo "Register Result: $($reg | ConvertTo-Json -Depth 2)"
} catch {
    echo "Register Failed: $_"
    # Proceeding in case user already exists
}

echo "`n2. Logging in..."
try {
    $login = Invoke-RestMethod -Uri "$base?action=login" -Method Post -Body $body -ContentType "application/json" -WebSession $session
    echo "Login Result: $($login | ConvertTo-Json -Depth 2)"
} catch {
    echo "Login Failed: $_"
    exit
}

echo "`n3. Checking Me..."
try {
    $me = Invoke-RestMethod -Uri "$base?action=me" -Method Get -WebSession $session
    echo "Me Result: $($me | ConvertTo-Json -Depth 2)"
} catch {
    echo "Me Failed: $_"
}

echo "`n4. Logging out..."
$logout = Invoke-RestMethod -Uri "$base?action=logout" -Method Post -WebSession $session
echo "Logout Result: $($logout | ConvertTo-Json -Depth 2)"

echo "`n5. Checking Me (should be false)..."
$me2 = Invoke-RestMethod -Uri "$base?action=me" -Method Get -WebSession $session
echo "Me Result: $($me2 | ConvertTo-Json -Depth 2)"
