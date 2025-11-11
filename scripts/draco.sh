#!/bin/bash

# This script is to update draco library from github 
# Author: Amin Shazrin

draco_project_name="draco"
draco_git_url="https://github.com/google/draco.git"
draco_branch="main"
draco_path="javascript/*"
draco_local_path="./public/three" # Must be without $draco_project_name at the end of the path. Only directory where $draco_project_name will be clone
source_dir=$(dirname "$0")
except_draco_path=("$draco_path""example/" "$draco_path""npm/" "$draco_path""with_asserts/" "$draco_path""*.html")

check_local_draco_folder(){
    if [[ ! -d "$draco_local_path" ]]; then
        echo $'Creating folder in '"$draco_local_path"''
        mkdir -p $draco_local_path
    fi
}

sparse_info(){
    git sparse-checkout init --no-cone

    local items="!/*\n$draco_path"

    if [[ ${#except_draco_path[@]} -gt 0 ]]; then
        for item in "${except_draco_path[@]}"; do
            items+="\n!$item"
        done
    fi

    echo -e $items >> .git/info/sparse-checkout
}

check_git(){
    echo "Add Git Remote Origin to $draco_git_url"
    git clone --filter=blob:none --no-checkout $draco_git_url
    cd $draco_project_name
}

replace_git(){
    echo "Removing existing $draco_project_name"
    rm -rf "$draco_project_name"
    echo "Cloning $basis_git_url into $draco_project_name"
    git clone --depth 1 --filter=blob:none --no-checkout "$draco_git_url" "$draco_project_name"
    cd "$draco_project_name" || exit 1
}

main(){
    if [[ ! -d "$draco_local_path""/$draco_project_name" && -z $PROD ]]; then
        echo "Draco not exists"
        check_local_draco_folder
        cd $draco_local_path
        check_git
        sparse_info
        git checkout $draco_branch
    elif [[ -n $PROD ]]; then
        if [[ ! -d "$draco_local_path""/$draco_project_name" ]]; then
            echo "Draco not exists"
            check_local_draco_folder
        else
            echo "draco exists on Production"
        fi
        cd $draco_local_path
        replace_git
        sparse_info
        git checkout $draco_branch
        echo "Delete draco .git folder for production"
        rm -rf .git
    else
        echo "Draco exists"
        cd $draco_local_path
        echo "Updating Draco..."
        git fetch origin
        git pull
    fi
}

# Initialize
main