#!/bin/bash

# This script is to update basis library from threeJS github
# Author: Amin Shazrin

basis_project_name="three.js"
basis_git_url="https://github.com/mrdoob/three.js.git"
basis_branch="dev"
basis_path="examples/jsm/libs/basis/*"
basis_local_path="./public/three" # Must be without $basis_project_name at the end of the path. Only directory where $basis_project_name will be clone
source_dir=$(dirname "$0")
except_basis_path=("$basis_path""*.md")

check_local_basis_folder(){
    if [[ ! -d "$basis_local_path" ]]; then
        echo $'Creating folder in '"$basis_local_path"''
        mkdir -p $basis_local_path
    fi
}

sparse_info(){
    git sparse-checkout init --no-cone

    local items="!/*\n$basis_path"

    if [[ ${#except_basis_path[@]} -gt 0 ]]; then
        echo "Remove exeception(s) files/directory"
        for item in "${except_basis_path[@]}"; do
            items+="\n!$item"
        done
    fi

    echo -e $items >> .git/info/sparse-checkout
}

check_git(){
    echo "Add Git Remote Origin to $basis_git_url"
    git clone --filter=blob:none --no-checkout $basis_git_url
    cd $basis_project_name
}

replace_git(){
    echo "Removing existing $basis_project_name"
    rm -rf "$basis_project_name"
    echo "Cloning $basis_git_url into $basis_project_name"
    git clone --depth 1 --filter=blob:none --no-checkout "$basis_git_url" "$basis_project_name"
    cd "$basis_project_name" || exit 1
}

main(){
    if [[ ! -d "$basis_local_path""/$basis_project_name" && -z $PROD ]]; then
        echo "Basis not exists"
        check_local_basis_folder
        cd $basis_local_path
        check_git
        sparse_info
        git checkout $basis_branch

    elif [[ -n $PROD ]]; then
        if [[ ! -d "$basis_local_path""/$basis_project_name" ]];then
            echo "Basis not exists"
            check_local_basis_folder
        else
            echo "basis exists on Production"
        fi
        cd $basis_local_path
        replace_git
        sparse_info
        git checkout $basis_branch
        echo "Delete basis .git folder for production"
        rm -rf .git
    else
        echo "basis exists"
        cd $basis_local_path
        echo "Updating Basis..."
        git fetch origin
        git pull
    fi
}

# Initialize
main