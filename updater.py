# -*- coding: utf-8 -*-
# !/usr/bin/python3

import logging
import os.path
import shutil

import requests

if __name__ == '__main__':
    # Set Logging
    LOG_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), os.path.abspath(__file__).replace(".py", ".log"))
    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s", handlers=[logging.FileHandler(LOG_FILE), logging.StreamHandler()])
    logger = logging.getLogger()

    logger.info("----------------------------------------------------")

    # Set RPIs
    RPIs = {"192.168.1.14": "/Volumes/RPI4/HWMonitorServer/"}
    # RPIs = {"192.168.1.14": "/Volumes/RPI4/HWMonitorServer/", "192.168.1.15": "/Volumes/RPI3A/HWMonitorServer/"}

    # Set baseFolder
    baseFolder = os.path.dirname(__file__)

    # Iterate over every RPI
    for ipAddress, RPI in RPIs.items():
        logger.info("Device: " + RPI)

        # Delete Remote Base Files
        remote_baseFiles = [f for f in os.listdir(RPI) if os.path.isfile(os.path.join(RPI, f))]
        for f in remote_baseFiles:
            logger.info("Remove baseFile: " + f)
            os.remove(os.path.join(RPI, f))

        # Copy Local Base Files
        local_baseFiles = [f for f in os.listdir(baseFolder) if os.path.isfile(os.path.join(baseFolder, f)) and f.endswith(".py")]
        for f in local_baseFiles:
            logger.info("Copy mainFile: " + f)
            local_baseFile = os.path.join(baseFolder, f)
            remote_baseFile = os.path.join(RPI, f)
            shutil.copy2(local_baseFile, remote_baseFile)

        # Set local and remote MainFolder
        local_MainFolder = os.path.join(baseFolder, "HWMonitorServer")
        remote_MainFolder = os.path.join(RPI, "HWMonitorServer")

        # Delete remote_mainFiles
        remote_mainFiles = [f for f in os.listdir(remote_MainFolder) if os.path.isfile(os.path.join(remote_MainFolder, f))]
        for f in remote_mainFiles:
            logger.info("Remove mainFile: " + f)
            os.remove(os.path.join(remote_MainFolder, f))

        # Copy local_mainFiles:
        local_mainFiles = [f for f in os.listdir(local_MainFolder) if os.path.isfile(os.path.join(local_MainFolder, f))]
        for f in local_mainFiles:
            logger.info("Copy mainFile: " + f)
            shutil.copy2(os.path.join(local_MainFolder, f), os.path.join(remote_MainFolder, f))

        # Delete remoteSubFolders
        remoteSubFolders = [f for f in os.listdir(remote_MainFolder) if os.path.isdir(os.path.join(remote_MainFolder, f)) and f != "static"]
        for subFolder in remoteSubFolders:
            logger.info("Remove subFolder: " + subFolder)
            subFolder = os.path.join(remote_MainFolder, subFolder)
            shutil.rmtree(subFolder)

        # Copy localSubFolders
        localSubFolders = [f for f in os.listdir(local_MainFolder) if os.path.isdir(os.path.join(local_MainFolder, f)) and f != "static"]
        for subFolder in localSubFolders:
            logger.info("Copy subFolder: " + subFolder)
            remoteSubFolder = os.path.join(remote_MainFolder, subFolder)
            localSubFolder = os.path.join(local_MainFolder, subFolder)
            shutil.copytree(localSubFolder, remoteSubFolder)

        # Remove Static Folders
        remote_StaticFolder = os.path.join(remote_MainFolder, "static")
        remote_StaticFolders = [f for f in os.listdir(remote_StaticFolder) if os.path.isdir(os.path.join(remote_StaticFolder, f)) and f != "_RECORDINGS"]
        for staticFolder in remote_StaticFolders:
            logger.info("Remove staticFolder: " + staticFolder)
            staticFolder = os.path.join(remote_StaticFolder, staticFolder)
            shutil.rmtree(staticFolder)

        # Copy Static Folders
        local_StaticFolder = os.path.join(local_MainFolder, "static")
        local_StaticFolders = [f for f in os.listdir(local_StaticFolder) if os.path.isdir(os.path.join(local_StaticFolder, f)) and f != "_RECORDINGS"]
        for staticFolder in local_StaticFolders:
            logger.info("Copy staticFolder: " + staticFolder)
            local_staticFolder = os.path.join(local_StaticFolder, staticFolder)
            remote_staticFolder = os.path.join(remote_StaticFolder, staticFolder)
            shutil.copytree(local_staticFolder, remote_staticFolder)

        # Restart Server
        logger.info("Restart Server")
        r = requests.post(url="http://" + ipAddress + ":33377/main/power", data={"option": "restart"})
        logger.info(r.json())
