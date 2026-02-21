#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <youtube_url> [cookies_file]" >&2
  exit 1
fi

URL="$1"
COOKIES_FILE="${2:-${YOUTUBE_COOKIES_FILE:-}}"
WORKDIR="${YOUTUBE_WORKDIR:-/home/butu/.openclaw/workspace/tmp}"
mkdir -p "$WORKDIR"
cd "$WORKDIR"

ID="$(yt-dlp --get-id "$URL" 2>/dev/null | head -n1 || true)"
if [[ -z "$ID" ]]; then
  ID="video"
fi

COMMON_ARGS=(--no-playlist --no-warnings)
if [[ -n "$COOKIES_FILE" && -f "$COOKIES_FILE" ]]; then
  COMMON_ARGS+=(--cookies "$COOKIES_FILE")
fi

# 1) Try subtitles first (fast, no whisper needed)
yt-dlp "${COMMON_ARGS[@]}" --skip-download --write-sub --write-auto-sub --sub-langs "en.*,en" --sub-format "vtt/srt/best" -o "%(id)s" "$URL" >/dev/null 2>&1 || true

SUB_FILE="$(ls -1 ${ID}*.en*.vtt ${ID}*.en*.srt 2>/dev/null | head -n1 || true)"

if [[ -n "$SUB_FILE" && -f "$SUB_FILE" ]]; then
  python3 - <<'PY' "$SUB_FILE"
import re,sys,html
p=sys.argv[1]
text=open(p,'r',encoding='utf-8',errors='ignore').read()
text=re.sub(r'\d{2}:\d{2}:\d{2}\.\d+\s+-->\s+\d{2}:\d{2}:\d{2}\.\d+',' ',text)
text=re.sub(r'\d{2}:\d{2}:\d{2},\d+\s+-->\s+\d{2}:\d{2}:\d{2},\d+',' ',text)
text=re.sub(r'^\d+$',' ',text,flags=re.M)
text=re.sub(r'<[^>]+>',' ',text)
text=html.unescape(text)
lines=[re.sub(r'\s+',' ',ln).strip() for ln in text.splitlines()]
out=[]
prev=""
for ln in lines:
    if not ln or ln==prev: 
        continue
    out.append(ln)
    prev=ln
print('\n'.join(out))
PY
  exit 0
fi

# 2) Fallback: download audio + whisper
if ! yt-dlp "${COMMON_ARGS[@]}" -f ba -x --audio-format mp3 -o "%(id)s.%(ext)s" "$URL" >/dev/null; then
  echo "ERROR: Could not fetch subtitles/audio. If YouTube blocks, provide cookies file as 2nd arg." >&2
  exit 2
fi

AUDIO="$(ls -1 ${ID}.mp3 2>/dev/null | head -n1 || true)"
if [[ -z "$AUDIO" ]]; then
  AUDIO="$(ls -1 ${ID}.* 2>/dev/null | head -n1 || true)"
fi
if [[ -z "$AUDIO" ]]; then
  echo "ERROR: Audio file not found after download." >&2
  exit 3
fi

whisper "$AUDIO" --model "${WHISPER_MODEL:-turbo}" --output_format txt --output_dir "$WORKDIR" >/dev/null
TXT="${AUDIO%.*}.txt"
cat "$TXT"
