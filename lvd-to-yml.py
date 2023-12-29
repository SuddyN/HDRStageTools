import os
import subprocess
import sys
import glob


def run_example_exe(executable_path, directory):
    # Ensure the directory path ends with a separator
    directory = directory.rstrip(os.path.sep) + os.path.sep
    print(directory)

    # List all files in the directory
    files = glob.glob(directory+'**/*.lvd', recursive=True)
    print(files)

    # Run example.exe for each .lvd file
    for file in files:
        file_path = os.path.join(directory, file)
        output_path = os.path.splitext(os.path.basename(file_path))[0]+'.yml'
        command = [executable_path, file_path, output_path]
        print(f"Command: {command}")

        try:
            subprocess.run(command, check=True)
            # print(f"Successfully ran for {file}")
        except subprocess.CalledProcessError as e:
            print(f"Error running for {file}: {e}")


if __name__ == "__main__":
    # Check if both directory and executable paths are provided as command-line arguments
    if len(sys.argv) != 3:
        print("Usage: python script.py <example_exe_path> <directory_path>")
        sys.exit(1)

    # Get executable and directory paths from command-line arguments
    example_exe_path = sys.argv[1]
    directory_path = sys.argv[2]

    # Check if the directory exists
    if not os.path.isdir(directory_path):
        print(f"Error: Directory '{directory_path}' does not exist.")
        sys.exit(1)

    # Check if the executable exists
    if not os.path.isfile(example_exe_path):
        print(f"Error: Executable '{example_exe_path}' does not exist.")
        sys.exit(1)

    run_example_exe(example_exe_path, directory_path)
