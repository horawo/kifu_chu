$base = "http://127.0.0.1:8080/api"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# 1. Login
$creds = @{ username="testuser"; password="password123" } | ConvertTo-Json
try {
    Invoke-RestMethod -Uri "$base/auth?action=login" -Method Post -Body $creds -ContentType "application/json" -WebSession $session
    echo "Login successful"
} catch {
    echo "Login failed (maybe already logged in or user missing?)"
    # Try register if login fails?
    Invoke-RestMethod -Uri "$base/auth?action=register" -Method Post -Body $creds -ContentType "application/json" -WebSession $session | Out-Null
    Invoke-RestMethod -Uri "$base/auth?action=login" -Method Post -Body $creds -ContentType "application/json" -WebSession $session
}

# 2. Save Kifu
echo "Saving Kifu..."
$kifu = @{ title="My Test Game"; kifu_text="V2.2..."; is_public=$true } | ConvertTo-Json
try {
    $res = Invoke-RestMethod -Uri "$base/kifu?action=save" -Method Post -Body $kifu -ContentType "application/json" -WebSession $session
    echo "Save Result: $($res | ConvertTo-Json)"
    $id = $res.id
} catch {
    echo "Save Failed: $_"
    exit
}

# 3. List
echo "Listing..."
$list = Invoke-RestMethod -Uri "$base/kifu?action=list" -Method Get -WebSession $session
echo "List: $($list.list.Count) items found"

# 4. Get Detail
if ($id) {
    echo "Getting Detail for ID $id..."
    $detail = Invoke-RestMethod -Uri "$base/kifu?action=get&id=$id" -Method Get -WebSession $session
    echo "Detail Title: $($detail.kifu.title)"
}
