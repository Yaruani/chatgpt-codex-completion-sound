"use strict";

function findPcm16DataChunk(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) {
    throw new Error("Invalid WAV: file too short.");
  }

  if (
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WAVE"
  ) {
    throw new Error("Invalid WAV: RIFF/WAVE header not found.");
  }

  let offset = 12;
  let fmt = null;
  let data = null;

  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    const start = offset + 8;
    const end = start + size;

    if (end > buffer.length) {
      throw new Error(`Invalid WAV: truncated ${id} chunk.`);
    }

    if (id === "fmt ") {
      if (size < 16) throw new Error("Invalid WAV: fmt chunk too short.");
      fmt = {
        audioFormat: buffer.readUInt16LE(start),
        bitsPerSample: buffer.readUInt16LE(start + 14)
      };
    } else if (id === "data") {
      data = { start, size };
    }

    offset = end + (size % 2);
  }

  if (!fmt) throw new Error("Invalid WAV: fmt chunk not found.");
  if (!data) throw new Error("Invalid WAV: data chunk not found.");
  if (fmt.audioFormat !== 1) throw new Error("Unsupported WAV: PCM required.");
  if (fmt.bitsPerSample !== 16) throw new Error("Unsupported WAV: 16-bit PCM required.");

  return data;
}

function scalePcm16Wav(source, volumePercent) {
  const volume = Math.max(0, Math.min(100, Math.round(Number(volumePercent))));
  const output = Buffer.from(source);
  const data = findPcm16DataChunk(output);
  const factor = volume / 100;

  for (let offset = data.start; offset + 1 < data.start + data.size; offset += 2) {
    const sample = output.readInt16LE(offset);
    let scaled = Math.round(sample * factor);
    scaled = Math.max(-32768, Math.min(32767, scaled));
    output.writeInt16LE(scaled, offset);
  }

  return output;
}

module.exports = {
  findPcm16DataChunk,
  scalePcm16Wav
};
