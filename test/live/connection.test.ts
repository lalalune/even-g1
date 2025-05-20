import { describe, it, expect } from 'vitest';
import { GlassesManager } from '../../src/bluetoothManager';

describe('live connection', () => {
  if (!process.env.LIVE_TEST) {
    it('skipped', () => {
      console.log('Set LIVE_TEST=1 to enable live tests');
    });
    return;
  }

  it('scan and connect', async () => {
    const manager = new GlassesManager();
    await manager.scanAndConnect();
    expect(manager.left_glass || manager.right_glass).toBeTruthy();
  });
});
