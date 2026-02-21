# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

## Local YouTube Summary Pipeline

- Transcript extractor script: `bin/youtube_transcript.sh`
- Default temp dir: `/home/butu/.openclaw/workspace/tmp`
- Optional cookies file env var: `YOUTUBE_COOKIES_FILE`
- Whisper model override env var: `WHISPER_MODEL` (default: `turbo`)

Example:

```bash
bin/youtube_transcript.sh "https://www.youtube.com/watch?v=<id>" ~/youtube-cookies.txt
```

If YouTube blocks with "Sign in to confirm you’re not a bot", export cookies (Netscape format) and pass the file path as arg 2.

---

Add whatever helps you do your job. This is your cheat sheet.
