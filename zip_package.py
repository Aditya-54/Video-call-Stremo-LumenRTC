import shutil
import os
import sys

def zip_release():
    src = "dist/LumenRTC"
    dst = "LumenRTC_Setup"
    
    if not os.path.exists(src):
        print(f"Error: Source directory {src} does not exist.")
        sys.exit(1)
        
    print(f"Zipping {src} to {dst}.zip ...")
    shutil.make_archive(dst, 'zip', root_dir='dist', base_dir='LumenRTC')
    print(f"Success! Created {dst}.zip")

if __name__ == "__main__":
    zip_release()
