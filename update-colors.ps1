# Script to update color classes to archaeological theme
$files = @()
$files += Get-ChildItem -Path "frontend\src\pages\*.tsx" -Recurse
$files += Get-ChildItem -Path "frontend\src\components\*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Replace patterns
    $content = $content -replace 'bg-gray-50', ''
    $content = $content -replace 'text-gray-900', 'text-archaeological-charcoal'
    $content = $content -replace 'text-gray-700', 'text-archaeological-charcoal'
    $content = $content -replace 'text-gray-600', 'text-archaeological-charcoal'
    $content = $content -replace 'text-gray-500', 'text-archaeological-olive'
    $content = $content -replace 'text-gray-400', 'text-archaeological-sage'
    $content = $content -replace 'text-green-600', 'text-archaeological-olive'
    $content = $content -replace 'border-gray-300', 'border-archaeological-lightBrown'
    $content = $content -replace 'border-gray-200', 'border-archaeological-lightBrown'
    $content = $content -replace 'bg-gray-100', 'bg-archaeological-warmGray'
    $content = $content -replace 'bg-gray-200', 'bg-archaeological-warmGray'
    
    Set-Content $file.FullName -Value $content -NoNewline
    Write-Host "Updated: $($file.Name)"
}

Write-Host "Done! Updated $($files.Count) files."

