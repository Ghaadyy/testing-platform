#!/bin/bash

sudo apt update
sudo apt install python3 pip git git-lfs nano

git lfs install
git clone https://huggingface.co/cckevinn/SeeClick

apt install python3.10-venv
python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

python3 app.py