#!/usr/bin/env bash
# Move only .git directories inside TARGET (e.g., ./public), run storybook build, restore them.
# Usage: ./scripts/build-storybook-safe.sh /path/to/public
# Author: ChatGPT Mini 5
set -euo pipefail

TARGET_DIR=${1:-}
if [[ -z "$TARGET_DIR" ]]; then
    echo "Usage: $0 /path/to/public"
    exit 2
fi

if [[ ! -d "$TARGET_DIR" ]]; then
    echo "Target does not exist: $TARGET_DIR"
    exit 2
fi

# normalize
TARGET_DIR=$(cd "$TARGET_DIR" && pwd)

# temp store must be outside target
TMP_STORE="/tmp/storybook-public-git-$$"
rm -rf "$TMP_STORE" 2>/dev/null || true
mkdir -p "$TMP_STORE"

echo "Target: $TARGET_DIR"
echo "Temp store: $TMP_STORE"

# mapping file (NUL-separated pairs: dest<NUL>orig<NUL>)
MAP_FILE="$TMP_STORE/map.bin"
: > "$MAP_FILE"

# 1) Move .git directories found only under TARGET (depth-first)
# Use find -depth so children are handled before parents (avoid nested move issues)
while IFS= read -r -d $'\0' gitdir; do
    # ensure gitdir is inside TARGET (defensive)
    case "$gitdir" in
        "$TARGET_DIR"/*) ;;
        *) continue ;;
    esac
    uid=$(uuidgen 2>/dev/null || echo "$RANDOM-$RANDOM-$RANDOM")
    dest="$TMP_STORE/git-$uid"
    mkdir -p "$dest"
    # record mapping pair
    printf '%s\0%s\0' "$dest" "$gitdir" >> "$MAP_FILE"
    echo "Moving: '$gitdir' -> '$dest'"
    mv "$gitdir" "$dest"
done < <(find "$TARGET_DIR" -depth -type d -name '.git' -print0)

# 2) Run storybook build (try common runners)
run_storybook() {
    if command -v storybook >/dev/null 2>&1; then
        storybook build
        return $?
    fi
    if command -v pnpm >/dev/null 2>&1; then
        pnpm storybook build
        return $?
    fi
    if command -v npx >/dev/null 2>&1; then
        npx storybook build
        return $?
    fi
    if command -v yarn >/dev/null 2>&1; then
        yarn storybook build
        return $?
    fi
    if command -v npm >/dev/null 2>&1; then
        npm run build-storybook --silent -- || npm run storybook --silent -- build || return 1
        return $?
    fi
    return 127
}

echo "Running storybook build..."
if ! run_storybook; then
    BUILD_EXIT=$?
    echo "storybook build failed with exit code $BUILD_EXIT"
else
    BUILD_EXIT=0
fi

# 3) Restore .git directories (reverse order)
echo "Restoring .git directories..."
# read MAP_FILE into array of fields (NUL-separated)
mapdata=$(cat "$MAP_FILE")
IFS=$'\0' read -r -a fields <<< "$mapdata" || true
total=${#fields[@]}

for (( i=total-2; i>=0; i-=2 )); do
    dest="${fields[i]}"
    orig="${fields[i+1]}"
    if [[ -z "$dest" || -z "$orig" ]]; then
        continue
    fi
    echo "Restoring: '$dest' -> '$orig'"
    mkdir -p "$(dirname "$orig")"
    if [[ -d "$dest" ]]; then
        mv "$dest" "$orig"
    else
        echo "  warning: temp directory missing: $dest"
    fi
done

# cleanup
rm -rf "$TMP_STORE" 2>/dev/null || true

echo "Done. storybook exit code: $BUILD_EXIT"
exit $BUILD_EXIT
