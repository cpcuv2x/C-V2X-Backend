import os
import subprocess
from pathlib import Path

is_panoptic_in_progress = False
video_original_directory = Path("C:/data") / 'videos' / 'original'
video_panoptic_directory = Path('C:/data') / 'videos' / 'panoptic'
print(video_original_directory)

# Ensure the videos directory exists
video_original_directory.mkdir(parents=True, exist_ok=True)
video_panoptic_directory.mkdir(parents=True, exist_ok=True)

# Function to check if a file exists
def file_exists(file_path):
    return os.path.exists(file_path)

# Function to scan the original videos folder and run Python script if necessary
def scan_and_process_videos():
    global is_panoptic_in_progress
    # Read original folder
    for file in os.listdir(video_original_directory):
        if file.endswith('.mp4'):
            file_name = os.path.splitext(file)[0]
            panoptic_video_path = video_panoptic_directory / f"{file_name}.mp4"
            # Check if the video file exists in the panoptic folder
            if not file_exists(panoptic_video_path):
                # Run Python script with filename
                run_python_script(file_name)

# Function to run Python script with filename as argument
def run_python_script(file_name):
    global is_panoptic_in_progress
    if is_panoptic_in_progress:
        return
    is_panoptic_in_progress = True
    print(f"Run panoptic file: {file_name}")
    activate_env_command = 'conda activate env_pytorch &&'
    command = f"{activate_env_command} python ./panoptic/panoptic_sementation.py {file_name}"
    python_process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = python_process.communicate()
    print(f"Python script stdout: {stdout.decode()}")
    print(f"Python script stderr: {stderr.decode()}")
    print(f"Python script process exited with code {python_process.returncode}")
    is_panoptic_in_progress = False

import time

# Define the scan_and_process_videos function and its dependencies here

def run_scan_and_process_videos():
    while True:
        print("Run Scan")
        scan_and_process_videos()
        time.sleep(60)  # Sleep for 60 seconds (1 minute)

run_scan_and_process_videos()
