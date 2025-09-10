#!/bin/bash

# A helper to add/update lygia to your project
# Author: Amin Shazrin

lygia_folder_name="lygia"
default_lygia_path="./src/shader"
prune_file="prune.py"
path=$1
source_dir=$(dirname "$0")
lygia_file_types=("glsl" "hlsl" "msl" "wgsl" "cuh")

prune_lygia() {
    if which python3 >/dev/null 2>&1; then
        # Go to directory
        cd "$1"

        # Check if prune file is available
        if [[ -f "$prune_file" ]]; then
            clear
            echo $'----------------------------------\n'
            echo "Lists of files available in lygia:"
            for item in "${lygia_file_types[@]}"; do
                echo "$item" | nl -w1 -s'. '
            done
            echo $'----------------------------------\n'
            read -p $'Type your file type from the above lists to be use on your project:\n> ' TYPE;
            python3 $prune_file --all --keep $TYPE
        else
            echo $'Prune file named '"$prune_file"' is not available. Are you sure lygia has this file?'
            echo $'Skipped...'
        fi

        # Back to source directory
        cd $source_dir
        echo "Current directory" $(pwd)
        
    else
        echo $'Python 3 is not installed. \nYou may removed your unused lygia files manually...'
        echo $'Skipped...'
    fi
}

check_lygia() {
    if [[ $1 != '' ]]; then
        # Remove existing lygia
        if [[ -d "$1" ]]; then
            # Make sure prompt a confirm remove custom path 
            read -p $'About to delete existing lygia package. Confirm delete this path (y/n)? \n> '"$1"$'\n> ' CONFIRM;

            if [[ $CONFIRM == 'y' ]]; then
                rm -rf "$1"
            fi
        fi

        # Add submodule path if not exists
        mkdir -p "$1"
    else
        # Remove existing lygia
        if [ -d "$default_lygia_path/$lygia_folder_name" ]; then
            echo "Run Delete existing lygia folder"
            rm -rf "$default_lygia_path/$lygia_folder_name"
        fi

        # Add submodule path if not exists
        mkdir -p "$default_lygia_path/$lygia_folder_name"
    fi
}

if [[ -z $path ]]; then
    check_lygia
    echo "Add to default path submodule \"$default_lygia_path/$lygia_folder_name\""
    npx degit https://github.com/patriciogonzalezvivo/lygia.git "$default_lygia_path/$lygia_folder_name"
    prune_lygia "$default_lygia_path/$lygia_folder_name"
else
    check_lygia $path
    # Add manually to some path
    echo "Clone to $path"
    npx degit https://github.com/patriciogonzalezvivo/lygia.git "$path"
    prune_lygia "$path"
fi