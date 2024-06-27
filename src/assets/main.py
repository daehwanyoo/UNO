import os
import json

def list_files_in_directory(directory):
    file_list = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            # If you only want to include specific file types, you can add a condition here
            # For example, to include only .png files:
            if file.endswith('.png'):
                file_list.append(os.path.join(root, file).replace('\\', '/'))  # Replace backslashes with forward slashes for consistency
    return file_list

def save_to_json(file_list, output_file):
    with open(output_file, 'w') as f:
        json.dump(file_list, f, indent=2)

if __name__ == "__main__":
    directory = '/Users/daehwanyoo/project/uno-v2/src/assets'  # Change this to your target directory
    output_file = '/Users/daehwanyoo/project/uno-v2/src/assets/cards.json'
    file_list = list_files_in_directory(directory)
    save_to_json(file_list, output_file)
    print(f"Saved {len(file_list)} file names to {output_file}")
