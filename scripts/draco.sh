#!/bin/bash

# This script is to update draco library from github 
# Author: Amin Shazrin

draco_project_name=draco
draco_git_url=https://github.com/google/draco.git
draco_path="javascript/*"
draco_local_path=./public/three/draco
source_dir=$(dirname "$0")
except_draco_path=("$draco_path""example/" "$draco_path""npm/" "$draco_path""with_asserts/")

check_local_draco_folder(){
    if [[ ! -d "$draco_local_path" ]]; then
        echo $'Creating folder in '"$draco_local_path"''
        mkdir -p $draco_local_path
    fi
}

sparse_info(){
    if [[ "$(git config --get core.sparseCheckout)" == "false" ]]; then
        echo "Enabling Sparse Checkout"
        git config core.sparseCheckout true
    fi

    local items="$draco_path"

    if [[ ${#except_draco_path[@]} > 0 ]]; then
        for item in "${except_draco_path[@]}"; do
            items+=$'\n'"!$item"
        done
    fi

    echo "Inserting .gitignore alike texts to sparse-checkout info"$'\n'"$items"
    echo $items >> .git/info/sparse-checkout
}

check_git(){
    if [[ ! -d ".git" ]]; then
        echo "Enabling Git Init"
        git init
    fi

    echo "Add Git Remote Origin to $draco_git_url"
    git remote add origin -f $draco_git_url
}

main(){
    if [[ ! -d "$draco_local_path" ]]; then
        echo "Draco not exists"
        check_local_draco_folder
        cd $draco_local_path
        check_git
        sparse_info
        git pull origin main
    else
        echo "Draco exists"
        cd $draco_local_path
        git fetch origin
        git pull
    fi
}

# Initialize
main