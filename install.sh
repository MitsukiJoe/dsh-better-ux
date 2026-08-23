#!/usr/bin/env bash
set -euo pipefail
REPO="${DSH_BETTER_UX_REPO:-https://github.com/MitsukiJoe/dsh-better-ux.git}"
SRC="${DSH_BETTER_UX_SRC:-$HOME/dsh-better-ux}"
WEB="${DSH_WEB_PROFILE:-$HOME/.dsh/profiles/web}"

if [ ! -d "$SRC/.git" ] && [ ! -f "$SRC/package.json" ]; then
  git clone "$REPO" "$SRC"
fi

python3 - "$SRC" "$WEB" <<'PY'
import json, sys
from pathlib import Path
src, web = Path(sys.argv[1]).resolve(), Path(sys.argv[2])
pkg_path = web / "package.json"
pkg = json.loads(pkg_path.read_text())
pkg.setdefault("dependencies", {})["dsh-better-ux"] = f"file:{src}"
bundles = pkg.setdefault("dsh", {}).setdefault("profile", {}).setdefault("bundles", [])
if "dsh-better-ux" not in bundles:
    bundles.append("dsh-better-ux")
pkg_path.write_text(json.dumps(pkg, indent=2) + "\n")
nm = web / "node_modules"
nm.mkdir(exist_ok=True)
link = nm / "dsh-better-ux"
if link.is_symlink() or link.exists():
    link.unlink()
link.symlink_to(src)
print(f"linked {link} -> {src}")
PY

echo "Restart dsh web (or relaunch DeepSeek Harness)."
