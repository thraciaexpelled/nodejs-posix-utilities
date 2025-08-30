#!/usr/bin/env python

# I'm so sorry, but a little python
# is indeed needed.

import sys
import os

def var_is_empty(var: any) -> bool:
    if not var: return True
    return False

def main(argc: int, argv: list[str]) -> int:
    assert argc > 1, "No arguments provided"

    split_path: list[str] = os.environ.get('PATH').split(":")
    assert var_is_empty(split_path) == False, f"No path  ({split_path})"

    idx: int = int(argv[1])

    print("%s\n" % split_path[idx], end='')

    return 0

if __name__ == '__main__':
    sys.exit(main(len(sys.argv), sys.argv))
