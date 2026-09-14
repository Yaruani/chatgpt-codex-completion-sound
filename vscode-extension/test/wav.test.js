"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const { scalePcm16Wav } = require("../src/wav");

function makeTinyWav(sample) {
  const buffer = Buffer.alloc(46);
  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(38, 4);
  buffer.write("WAVE", 8, "ascii");
  buffer.write("fmt ", 12, "ascii");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(44100, 24);
  buffer.writeUInt32LE(88200, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36, "ascii");
  buffer.writeUInt32LE(2, 40);
  buffer.writeInt16LE(sample, 44);
  return buffer;
}

test("scales PCM16 amplitude to 50%", () => {
  const out = scalePcm16Wav(makeTinyWav(10000), 50);
  assert.equal(out.readInt16LE(44), 5000);
});

test("0% mutes PCM16 sample", () => {
  const out = scalePcm16Wav(makeTinyWav(-10000), 0);
  assert.equal(out.readInt16LE(44), 0);
});
