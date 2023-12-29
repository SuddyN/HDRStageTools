import os
import subprocess
import sys
import glob


def run_example_exe(executable_path, input_directory, output_directory):
    # Ensure the directory path ends with a separator
    input_directory = input_directory.rstrip(os.path.sep) + os.path.sep
    print(input_directory)
    output_directory = output_directory.rstrip(os.path.sep) + os.path.sep
    print(output_directory)

    # List all files in the directory
    files = glob.glob(input_directory + "**/*.lvd", recursive=True)
    print(files)

    # Run example.exe for each .lvd file
    for file in files:
        file_path = os.path.join(input_directory, file)
        output_path = os.path.join(
            output_directory, os.path.splitext(os.path.basename(file_path))[0] + ".yml"
        )
        command = [executable_path, file_path, output_path]

        try:
            subprocess.run(command, check=True)
            # print(f"Successfully ran for {file}")
        except subprocess.CalledProcessError as e:
            print(f"Error running for {file}: {e}")


if __name__ == "__main__":
    # Check if both directory and executable paths are provided as command-line arguments
    if len(sys.argv) != 4:
        print(
            "Usage: python script.py <example_exe_path> <input_directory_path>"
            " <output_directory_path>"
        )
        sys.exit(1)

    # Get executable and directory paths from command-line arguments
    example_exe_path = sys.argv[1]
    input_directory_path = sys.argv[2]
    ouput_directory_path = sys.argv[3]

    # Check if the executable exists
    if not os.path.isfile(example_exe_path):
        print(f"Error: Executable '{example_exe_path}' does not exist.")
        sys.exit(1)

    # Check if the directory exists
    if not os.path.isdir(input_directory_path):
        print(f"Error: Directory '{input_directory_path}' does not exist.")
        sys.exit(1)

    # Check if the directory exists
    if not os.path.isdir(ouput_directory_path):
        print(f"Error: Directory '{ouput_directory_path}' does not exist.")
        sys.exit(1)

    run_example_exe(example_exe_path, input_directory_path, ouput_directory_path)
