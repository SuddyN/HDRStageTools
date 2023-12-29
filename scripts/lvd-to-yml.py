import os
import subprocess
import sys
import glob


def run_example_exe(executable_path, input_directory, output_directory):
    # Ensure the directory path ends with a separator
    input_directory = input_directory.rstrip(os.path.sep) + os.path.sep
    output_directory = output_directory.rstrip(os.path.sep) + os.path.sep

    # List all files in the directory
    files = glob.glob(input_directory + "**/normal*/param/*.lvd", recursive=True)

    # Run example.exe for each .lvd file
    for file in files:
        # construct the input path
        file_path = os.path.join(input_directory, file)

        # construct the output path
        output_file_path = os.path.join(
            output_directory, os.path.splitext(file_path.replace(input_directory, ""))[0] + ".yml"
        )

        # make the output directory if it doesn't exist
        output_file_directory = output_file_path.replace(os.path.basename(output_file_path), "")
        if not os.path.exists(output_file_directory):
            # Create a new directory because it does not exist
            os.makedirs(output_file_directory)
            print(f"Made a new directory: {output_file_directory}")

        # construct the final command
        command = [executable_path, file_path, output_file_path]

        # run the command
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
