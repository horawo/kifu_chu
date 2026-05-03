$base = "http://127.0.0.1:8080/api"
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession

# 1. Login
$creds = @{ username="testuser"; password="password123" } | ConvertTo-Json
Invoke-RestMethod -Uri "$base/auth?action=login" -Method Post -Body $creds -ContentType "application/json" -WebSession $session | Out-Null
echo "Logged in"

# 2. Save Initial
echo "Saving Initial..."
$init = @{ title="My Custom Setup"; kifu_text="InitialBoard..." } | ConvertTo-Json
$res = Invoke-RestMethod -Uri "$base/initial?action=save" -Method Post -Body $init -ContentType "application/json" -WebSession $session
echo "Save Result: $($res | ConvertTo-Json)"
$id = $res.id

# 3. List
echo "Listing..."
$list = Invoke-RestMethod -Uri "$base/initial?action=list" -Method Get -WebSession $session
echo "List Count: $($list.list.Count)"

# 4. Get
if ($id) {
    echo "Getting $id..."
    $det = Invoke-RestMethod -Uri "$base/initial?action=get&id=$id" -Method Get -WebSession $session
    echo "Title: $($det.initial.title)"
}
