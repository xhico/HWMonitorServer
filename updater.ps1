Clear-Host

$files = @("server.py", "gunicorn_config.py", "HWMonitorServer\__init__.py", "HWMonitorServer\config.json", "HWMonitorServer\config.py")
foreach ($file in $files)
{
    Copy-Item .\$file Y:\HWMonitorServer\$file -Force
    Copy-Item .\$file X:\HWMonitorServer\$file -Force
}

$folders = @("main", "stats", "bots", "history", "eye", "templates", "static\css", "static\images", "static\js")
foreach ($folder in $folders)
{
    Remove-Item Y:\HWMonitorServer\HWMonitorServer\$folder\* -Recurse -Force
    Copy-Item .\HWMonitorServer\$folder\* Y:\HWMonitorServer\HWMonitorServer\$folder\ -Recurse -Force

    Remove-Item X:\HWMonitorServer\HWMonitorServer\$folder\* -Recurse -Force
    Copy-Item .\HWMonitorServer\$folder\* X:\HWMonitorServer\HWMonitorServer\$folder\ -Recurse -Force
}

Invoke-WebRequest -UseBasicParsing "http://192.168.1.14:33377/main/power" -Method POST -Body "{ 'option':'restart'}" | Out-Null
Invoke-WebRequest -UseBasicParsing "http://192.168.1.15:33377/main/power" -Method POST -Body "{ 'option':'restart'}" | Out-Null