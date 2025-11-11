#!/bin/bash

# A helper to add/update lygia to your project
# Author: Amin Shazrin

# Flexible Values that suits to your needs...
lygia_folder_name="lygia"
default_lygia_path="./src/glsl"
prune_file="prune.py"
path=$1

# Constant Values (YOU NOT MIGHT CHANGE THIS VALUES)
LYGIA_FILE_TYPES=("glsl" "hlsl" "msl" "wgsl" "cuh") # Remove/Add the lists of lygia options files available to this array
GITHUB_RAW="https://raw.githubusercontent.com" # Github Raw URL
REPO_OWNER="patriciogonzalezvivo"  # Change this if lygia is transfered to other repo owner
REPO_NAME="lygia"    # Change this if lygia library is renamed to something else
BRANCH="main"  # Change this if the repo owner decides other names for the master branch



prune_lygia() {
    if which python3 >/dev/null 2>&1; then
        # Go to directory
        cd "$1"

        # Check if prune file is available
        if [[ -f "$prune_file" ]]; then
            clear
            echo $'----------------------------------\n'
            echo "Lists of files available in lygia:"
            for i in "${!LYGIA_FILE_TYPES[@]}"; do
                display_index=$((i + 1))
                echo "$display_index. ${LYGIA_FILE_TYPES[$i]}"
            done
            echo $'----------------------------------\n'
            if [[ -z "$TYPE" ]]; then
                read -p $'Type your file type from the above lists to be use on your project:\n> ' TYPE; 
            fi
            python3 $prune_file --all --keep $TYPE
        else
            echo $'Prune file named '"$prune_file"' is not available. Are you sure lygia has this file?'
            echo $'Skipped...'
        fi
    else
        echo $'Python 3 is not installed. \nYou may removed your unused lygia files manually...'
        echo $'Skipped...'
    fi
    if [[ -n $PROD ]]; then
        echo "Delete .git folder for PRODUCTION"
        rm -rf "$1/.git"
    fi
}

check_npm_version(){
    local output=""
    if [[ $(npm -v) ]]; then
        output=$(
            cd $default_lygia_path/$lygia_folder_name
            echo $(npm pkg get version)
        )
    fi

    echo $output
}

confirm_update_lygia(){
    local local_version="$1"

    local PACKAGE_JSON_URL="${GITHUB_RAW}/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/package.json"

    # Fetch the package.json and extract the version using grep and sed or awk
    # Using grep and sed:
    next_version=$(curl -s "${PACKAGE_JSON_URL}" | grep '"version":' | sed -E 's/.*"version": "([^"]+)".*/\1/')

    # Clear outputs
    # clear

    if [[ "${local_version//\"/}" != "$next_version" ]]; then
        read -p $'Latest lygia version is available to download\n'"Version: ${local_version//\"/} -> $next_version"$'\nProcess to download? (y/n)\n> ' DOWNLOAD_LATEST;

        if [[ "$DOWNLOAD_LATEST" == "y" ]]; then
            echo "Download Latest..."
            echo 1
        else
            echo "Skip update lygia. Maintain existing version: $local_version"
            exit 0
        fi
    else
        read -p $'Your local version is similar to the latest lygia package. Overwrite anyway? (y/n)\n> ' OVERWRITE;

        if [[ "$OVERWRITE" == "y" ]]; then
            echo "Overwrite Latest..."
            echo 1
        else
            echo "Skip update lygia. Maintain existing version: $local_version"
            exit 0
        fi 
    fi
}

check_lygia() {
    if [[ $1 != '' ]]; then
        # Remove existing lygia
        if [[ -d "$1" ]]; then
            version=$(check_npm_version)

            if [[ -z $PROD ]]; then
                # Check if update lygia needed
                confirm_update_lygia "$version"
            fi

            rm -rf "$1"
        fi

        # Add submodule path if not exists
        mkdir -p "$1"
    else
        # Remove existing lygia
        if [ -d "$default_lygia_path/$lygia_folder_name" ]; then
            version=$(check_npm_version)

            if [[ -z $PROD ]]; then
                # Check if update lygia needed
                confirm_update_lygia "$version"
            fi

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
    check_lygia "$path/$lygia_folder_name"
    # Add manually to some path
    echo "Clone to $path/$lygia_folder_name"
    npx degit https://github.com/patriciogonzalezvivo/lygia.git "$path/$lygia_folder_name"
    prune_lygia "$path/$lygia_folder_name"
fi