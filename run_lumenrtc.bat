@echo off
echo Installing Dependencies (First run only)...
python -m pip install -r requirements.txt
cls
echo Starting LumenRTC...
python python_src/terminal_chat.py
pause
