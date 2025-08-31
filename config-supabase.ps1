# Configuration Supabase pour SMS Pro 3
Write-Host "Configuration Supabase..." -ForegroundColor Cyan

Write-Host "Entrez vos credentials Supabase:"
$url = Read-Host "PROJECT URL"
$anon = Read-Host "ANON KEY" 
$service = Read-Host "SERVICE ROLE KEY"
$db = Read-Host "DATABASE URL"

# Generer secrets
$jwt = -join ((1..32) | ForEach {'{0:X2}' -f (Get-Random -Max 256)})
$nextauth = -join ((1..32) | ForEach {'{0:X2}' -f (Get-Random -Max 256)})

# Creer .env.local
@"
DATABASE_URL=$db
SUPABASE_URL=$url
SUPABASE_ANON_KEY=$anon
SUPABASE_SERVICE_ROLE_KEY=$service
ORANGE_SMS_CLIENT_ID=MNr0WscAlwy4qQ9dmfMfC4NIAmjZ5D4z
ORANGE_SMS_CLIENT_SECRET=SY4hPdkZ93gvMxqe7FMk6ka6dGUtl8oLYU5ViweMZKL9
JWT_SECRET=$jwt
NEXTAUTH_SECRET=$nextauth
NEXTAUTH_URL=http://localhost:3000
"@ | Out-File ".env.local" -Encoding UTF8

Write-Host "Configuration terminee!" -ForegroundColor Green
