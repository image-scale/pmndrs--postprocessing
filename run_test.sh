#!/bin/bash
set -eo pipefail
cd "$(dirname "$0")"
NODE_OPTIONS="--experimental-vm-modules" npx jest --no-coverage --forceExit 2>&1
