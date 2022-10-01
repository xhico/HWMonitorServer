cls

Copy-Item .\server.py Y:\HWMonitorServer\server.py -Force

Remove-Item Y:\HWMonitorServer\templates\* -R -Force
Copy-Item .\templates\*  Y:\HWMonitorServer\templates\ -R -Force

Remove-Item Y:\HWMonitorServer\static\css\* -R -Force
Copy-Item .\static\css\* Y:\HWMonitorServer\static\css\ -R -Force

Remove-Item Y:\HWMonitorServer\static\js\* -R -Force
Copy-Item .\static\js\* Y:\HWMonitorServer\static\js\ -R -Force

Remove-Item Y:\HWMonitorServer\static\images\* -R -Force
Copy-Item .\static\images\* Y:\HWMonitorServer\static\images\ -R -Force