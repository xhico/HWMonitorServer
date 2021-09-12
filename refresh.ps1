Remove-Item Y:\RaspberryPiHWMonitorServer\static\ -R -Force -Confirm:$False;
Remove-Item Y:\RaspberryPiHWMonitorServer\templates\ -R -Force -Confirm:$False;
Remove-Item Y:\RaspberryPiHWMonitorServer\server.py -Force -Confirm:$False;
Copy-Item .\templates\ -R Y:\RaspberryPiHWMonitorServer\;
Copy-Item .\static\ -R Y:\RaspberryPiHWMonitorServer\;
Copy-Item .\server.py -R Y:\RaspberryPiHWMonitorServer\;

<#
Remove-Item X:\RaspberryPiHWMonitorServer\static\ -R -Force -Confirm:$False;
Remove-Item X:\RaspberryPiHWMonitorServer\templates\ -R -Force -Confirm:$False;
Remove-Item X:\RaspberryPiHWMonitorServer\server.py -Force -Confirm:$False;
Copy-Item .\templates\ -R X:\RaspberryPiHWMonitorServer\;
Copy-Item .\static\ -R X:\RaspberryPiHWMonitorServer\;
Copy-Item .\server.py -R X:\RaspberryPiHWMonitorServer\;

Remove-Item W:\RaspberryPiHWMonitorServer\static\ -R -Force -Confirm:$False;
Remove-Item W:\RaspberryPiHWMonitorServer\templates\ -R -Force -Confirm:$False;
Remove-Item W:\RaspberryPiHWMonitorServer\server.py -Force -Confirm:$False;
Copy-Item .\templates\ -R W:\RaspberryPiHWMonitorServer\;
Copy-Item .\static\ -R W:\RaspberryPiHWMonitorServer\;
Copy-Item .\server.py -R W:\RaspberryPiHWMonitorServer\;
#>