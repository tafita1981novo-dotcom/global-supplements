<?php
/**
 * Auto-deploy webhook para Hostinger
 * Chame: https://globalsupplements.site/deploy-webhook.php?key=DEPLOY_SECRET
 * 
 * Este script:
 * 1. Baixa o dist.zip da Release do GitHub
 * 2. Extrai para /public_html/
 * 3. Configura .htaccess SPA
 */

$DEPLOY_KEY = 'gs-deploy-2026-secure';
$GITHUB_RELEASE_URL = 'https://github.com/tafita81/global-supplements/releases/download/deploy-v1/dist.zip';

header('Content-Type: text/plain');

if (!isset($_GET['key']) || $_GET['key'] !== $DEPLOY_KEY) {
    http_response_code(403);
    die('Forbidden');
}

echo "=== Global Supplements Auto-Deploy ===\n";
echo "Time: " . date('Y-m-d H:i:s') . "\n\n";

// 1. Download dist.zip
echo "1. Downloading dist.zip...\n";
$zipPath = '/tmp/gs-dist.zip';
$ch = curl_init($GITHUB_RELEASE_URL);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 120);
$data = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || empty($data)) {
    die("FAIL: Download failed (HTTP $httpCode)\n");
}
file_put_contents($zipPath, $data);
echo "   Downloaded: " . strlen($data) . " bytes\n";

// 2. Extract to public_html
echo "2. Extracting...\n";
$zip = new ZipArchive;
if ($zip->open($zipPath) === TRUE) {
    $extractPath = dirname(__DIR__); // /public_html parent or current
    $zip->extractTo($extractPath);
    $zip->close();
    echo "   Extracted to: $extractPath\n";
} else {
    die("FAIL: Cannot open zip\n");
}

// 3. Create .htaccess
echo "3. Creating .htaccess...\n";
$htaccess = <<<'HT'
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
HT;
file_put_contents($extractPath . '/.htaccess', $htaccess);

// Cleanup
unlink($zipPath);

echo "\n=== DEPLOY COMPLETE ===\n";
echo "Site updated at: " . date('Y-m-d H:i:s') . "\n";
?>
