#!/usr/bin/env python

import os
import re
import shutil
import sys
# import argparse as ap

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
    x = input("Proceed? [Y/n] ")
    match x.casefold():
        case 'y': pass
        case 'yes': pass
        case 'n': proceed = False
        case 'no': proceed = False
        case _: pass

    if proceed:
        user_home: str = os.environ.get("HOME")
        shell_resources: str = os.path.join(user_home, ".bashrc")

        with open(shell_resources, 'a') as rc:
            rc.write("\n\n# These lines were added by nodejs-posix-utilities")
            rc.write("\nexport NODE_PATH=\"$(npm root -g):$NODE_PATH\"'\n\n")
        return 0
    else: return 1

if __name__ == '__main__':
    our_path: str = os.environ.get('PATH').split(':')[0]
    if install_files(query_all_files(), our_path) == 0:
        sys.exit(mutilate_shell_resources())
