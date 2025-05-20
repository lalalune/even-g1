import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { CommandLogger } from '../../src/commandLogger';

describe('CommandLogger', () => {
  const file = path.join(__dirname, 'temp_log.json');
  afterEach(() => {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  });

  it('logs entries', () => {
    const logger = new CommandLogger(file);
    const entry = logger.log('left', Buffer.from([0x01]));
    expect(entry.command).toBe('BRIGHTNESS');
    const contents = JSON.parse(fs.readFileSync(file, 'utf-8'));
    expect(contents.length).toBe(1);
  });
});
