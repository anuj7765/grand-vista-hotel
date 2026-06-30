param(
  [string]$GitHubToken = "",
  [string]$VercelToken = ""
)

$ErrorActionPreference = "Stop"
$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $dir

function Print-Header {
  param($Text)
  Write-Host "`n========================================" -ForegroundColor Cyan
  Write-Host " $Text" -ForegroundColor Cyan
  Write-Host "========================================" -ForegroundColor Cyan
}

# --- GitHub ---
Print-Header "Step 1: Push to GitHub"

if (-not $GitHubToken) {
  $GitHubToken = Read-Host "Enter GitHub Personal Access Token (with repo scope)"
}

$env:GITHUB_TOKEN = $GitHubToken

$repoName = "grand-vista-hotel"
$repoUrl = "https://github.com/anuj7765/$repoName"

# Create repo on GitHub
$body = @{ name = $repoName; private = $false } | ConvertTo-Json
$headers = @{ Authorization = "token $GitHubToken"; Accept = "application/json" }

try {
  $existing = Invoke-RestMethod -Uri "https://api.github.com/repos/anuj7765/$repoName" -Headers $headers -ErrorAction SilentlyContinue
  if ($existing) { Write-Host "Repository already exists." -ForegroundColor Yellow }
} catch {
  $resp = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method POST -Body $body -ContentType "application/json" -Headers $headers
  Write-Host "Repository created: $($resp.html_url)" -ForegroundColor Green
}

# Push code
git remote remove origin 2>$null
git remote add origin "https://anuj7765:$GitHubToken@github.com/anuj7765/$repoName.git"
git push -u origin master
git remote set-url origin "https://github.com/anuj7765/$repoName.git"
Write-Host "GitHub push complete!" -ForegroundColor Green

# --- Vercel ---
Print-Header "Step 2: Deploy to Vercel"

if (-not $VercelToken) {
  $VercelToken = Read-Host "Enter Vercel Token (get from https://vercel.com/account/tokens)"
}

npx vercel deploy --prod --token $VercelToken --yes

Write-Host "`nDeployment complete!" -ForegroundColor Green
