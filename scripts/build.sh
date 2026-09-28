#!/usr/bin/env bash
set -euo pipefail

project_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
dist_root="$project_root/dist"

rm -rf "$dist_root"
mkdir -p "$dist_root/server" "$dist_root/.openai"
node -e 'const fs=require("fs");const src=fs.readFileSync(process.argv[1],"utf8");const html=fs.readFileSync(process.argv[2],"utf8");fs.writeFileSync(process.argv[3],src.replace("__DASHBOARD_HTML__",JSON.stringify(html)))' "$project_root/worker/index.js" "$project_root/dashboard.html" "$dist_root/server/index.js"
cp "$project_root/.openai/hosting.json" "$dist_root/.openai/hosting.json"

echo "Built $dist_root"
