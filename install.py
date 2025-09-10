#!/usr/bin/env python

import os
import re
import shutil
import sys
import subprocess
import time

def query_all_files() -> list[str]:
    files: list[str] = []
    for j in os.listdir("."):
        if j.endswith(".js"):
            files.append(j)

    return files

def install_files(files: list[str], prefix: str) -> int:
    for file in files:
        try:
            print(f"processing {file}")
            # os.chmod(file, 755): too confusing
            os.system(f"chmod +x {file}")
        except Exception as e:
            sys.stderr.write("%s: %s\n" % file, e)
            return -1
        
        try:
            f: str = str(str("node.") + str(file)).removesuffix(".js")
            print(f"copying {file} to {os.path.join(prefix, f)}")
            shutil.copy(file, os.path.join(prefix, f))
        except Exception as e:
            sys.stderr.write(f"{file}: {e}\n")
            return -1
    return 0

def mutilate_shell_resources() -> int:
    print()
    print("WARNING: this script is about to append the following...")
    print("     'export NODE_PATH=\"$(npm root -g):$NODE_PATH\"'")
    print("...to your ~/.bashrc.\n")
    
    print("You can simply press enter if you have already done this\n")

    proceed: bool = True
    x: str = input("Proceed? [Y/n] ")
    match x.casefold():
        case 'y': pass
        case 'yes': pass
        case 'n': proceed = False
        case 'no': proceed = False
        case _: proceed = False

    if proceed:
        user_home: str = os.environ.get("HOME")
        shell_resources: str = os.path.join(user_home, ".bashrc")

        with open(shell_resources, 'a') as rc:
            rc.write("\n\n# These lines were added by nodejs-posix-utilities")
            rc.write("\nexport NODE_PATH=\"$(npm root -g):$NODE_PATH\"'\n\n")
        return 0
    else: return 1

def confirm_nt_environment() -> bool:
    if "msys" in sys.platform: return True
    return "win32" in sys.platform

def is_running_as_admin() -> bool:
    return __import__('ctypes').windll.shell32.IsUserAnAdmin()

# this is essentially a wrapper function for install_files(), but
# creates the directory "C:\Program Files\POSIX Utilities for NodeJS (Thraciaexpelled)\bin"
# where the utilities will reside.
# note that this script needs to be run with administrator privilliges in order for this
# method to work.
def install_in_nt_env()-> int:
    if not is_running_as_admin():
        sys.stderr.write("err: please run this script as administrator to continue\n")
        time.sleep(5)
        sys.exit(-1)

    print(f"starting installation on a {sys.platform} system")
    try:
        os.makedirs("C:\\Program Files\\POSIX Utilities for NodeJS (Thraciaexpelled)\\bin", exists_ok=True)
    except Exception as e:
        sys.stderr.write(f"error when creating installation folders: {e}\n")
        time.sleep(5)
        return -1

    prefix: str = "C:\\Program Files\\POSIX Utilities for NodeJS (Thraciaexpelled)\\bin"

    if install_files(query_all_files(), prefix) != 0:
        sys.stderr.write("err: could not install utilities\n")
        time.sleep(5)
        return 1

    # now we add this to the system path
    if sys.platform in ["msys", "cygwin"]:
        sys.stderr.write("err: posix environment provider detected; cannot continue\n")
        time.sleep(5)
        return -1

    try:
        command = f'setx PATH "%PATH%;{prefix}" /M'
        subprocess.run(command, shell=True, check=True)
    except Exception as e:
        sys.stderr.write(f"err: {e}\n")
        time.sleep(5)
        return -1

    return 0


def get_our_path() -> str | int:
    if confirm_nt_environment():
        sys.stderr.write("oh no. you are using microsoft windows or an adjacent NT environment..\n")
        if "msys" in sys.platform: return "/usr/bin"
        # get path for win32
        if sys.platform == "win32":
            # NT-Like splits paths by the semicolon
            # due to the fragility of NT-Like, we cannot
            # choose the first directory of the split path.
            # this means we have to take extra steps as talked about
            # in install_in_nt_env()
            sys.stderr.write("alert: randomly picking path items in NT-like is potentially dangerous\n")
            sys.stderr.write("alert: calling an alternative help function\n")
            return install_in_nt_env()
        return -1 

    return os.environ.get('PATH').split(':')[0]

if __name__ == '__main__':
    our_path: str | int = get_our_path()
    if type(our_path) == int:
        sys.stderr.write("err: cannot fetch your path\n")
        time.sleep(5)
        sys.exit(-1)

    if install_files(query_all_files(), our_path) == 0:
        sys.exit(mutilate_shell_resources())
