"use strict";

const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const { execFile } = require("child_process");
const { scalePcm16Wav } = require("./wav");

const VALID_SOUNDS = ["chime", "bell", "double", "soft"];

function clampVolume(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 65;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function sourceSoundPath(context, sound) {
  const safeSound = VALID_SOUNDS.includes(sound) ? sound : "bell";
  return context.asAbsolutePath(path.join("sounds", `${safeSound}.wav`));
}

async function getScaledSoundPath(context, sound, volumePercent) {
  const safeSound = VALID_SOUNDS.includes(sound) ? sound : "bell";
  const volume = clampVolume(volumePercent);
  const sourcePath = sourceSoundPath(context, safeSound);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Sound file not found: ${sourcePath}`);
  }

  const cacheDir = path.join(context.globalStorageUri.fsPath, "scaled-sounds");
  await fsp.mkdir(cacheDir, { recursive: true });

  const target = path.join(
    cacheDir,
    `${safeSound}-v1.2.0-${volume}.wav`
  );

  if (fs.existsSync(target)) return target;

  const source = await fsp.readFile(sourcePath);
  const output = volume === 100 ? source : scalePcm16Wav(source, volume);
  await fsp.writeFile(target, output);

  return target;
}

function encodePowerShell(script) {
  return Buffer.from(script, "utf16le").toString("base64");
}

async function playSound(context, sound, volumePercent) {
  const volume = clampVolume(volumePercent);

  if (volume === 0) {
    return { ok: true, muted: true };
  }

  if (process.platform !== "win32") {
    return {
      ok: false,
      error: `Unsupported platform: ${process.platform}. This release supports Windows.`
    };
  }

  let wavPath;
  try {
    wavPath = await getScaledSoundPath(context, sound, volume);
  } catch (error) {
    return { ok: false, error: String(error) };
  }

  const escaped = wavPath.replace(/'/g, "''");
  const script = `
$ErrorActionPreference = 'Stop'
$wav = '${escaped}'
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class CompletionSoundNative {
    [DllImport("winmm.dll", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern bool PlaySound(string pszSound, IntPtr hmod, uint fdwSound);
}
'@
$SND_SYNC = 0x0000
$SND_FILENAME = 0x00020000
$ok = [CompletionSoundNative]::PlaySound(
  $wav,
  [IntPtr]::Zero,
  $SND_SYNC -bor $SND_FILENAME
)
if (-not $ok) { throw "winmm PlaySound returned false." }
`;

  return await new Promise((resolve) => {
    execFile(
      "powershell.exe",
      [
        "-NoLogo",
        "-NoProfile",
        "-NonInteractive",
        "-ExecutionPolicy", "Bypass",
        "-EncodedCommand", encodePowerShell(script)
      ],
      { windowsHide: true, timeout: 10000 },
      (error, stdout, stderr) => {
        if (error) {
          resolve({
            ok: false,
            error: `${error.message}${stderr ? ` | ${stderr.trim()}` : ""}`
          });
          return;
        }

        resolve({ ok: true, path: wavPath });
      }
    );
  });
}

module.exports = {
  VALID_SOUNDS,
  clampVolume,
  sourceSoundPath,
  playSound
};
