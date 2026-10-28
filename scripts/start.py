"""Prefer the project's dependency environment for local development."""
import os
from pathlib import Path
import sys

root = Path(__file__).resolve().parent.parent
python = root / '.venv' / ('Scripts/python.exe' if os.name == 'nt' else 'bin/python')
os.execv(str(python) if python.exists() else sys.executable,
         [str(python) if python.exists() else sys.executable, str(root / 'server.py')])
