import PyInstaller.__main__
import os
import shutil

def build():
    print("Building LumenRTC.exe ...")
    
    # Clean previous build
    if os.path.exists("build"): shutil.rmtree("build")
    if os.path.exists("dist"): shutil.rmtree("dist")
    
    PyInstaller.__main__.run([
        'python_src/main.py',
        '--name=LumenRTC',
        '--onefile',
        '--windowed',  # Hide console window (remove for debugging)
        # '--icon=dist/icon.ico', # Placeholder if exists
        '--add-data=python_src;python_src', # Include source files just in case
        '--hidden-import=engineio.async_drivers.aiohttp',
        '--clean',
    ])
    
    print("Build Complete! Check dist/LumenRTC.exe")

if __name__ == "__main__":
    build()
