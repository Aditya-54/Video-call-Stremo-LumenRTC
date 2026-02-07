$source = "dist\LumenRTC"
$destination = "LumenRTC_Setup.zip"

If (Test-Path $destination) {
    Remove-Item $destination
}

Write-Host "Zipping LumenRTC..."
Compress-Archive -Path $source -DestinationPath $destination
Write-Host "Created $destination. You can send this file to your friend."
