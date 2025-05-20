import { describe, it, expect } from 'vitest';
import { constructBrightness } from '../../src/utils';
import { BrightnessAuto } from '../../src/models';

describe('constructBrightness', () => {
  it('builds correct buffer', () => {
    const buf = constructBrightness(0x10, BrightnessAuto.OFF);
    expect(buf).toEqual(Buffer.from([0x01, 0x10, 0x00]));
  });
});
