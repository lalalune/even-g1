import fs from 'fs';
import path from 'path';
import { Command } from './models';

export interface CommandLogEntry {
  side: string;
  command: string;
  timestamp: number;
}

export class CommandLogger {
  history: CommandLogEntry[] = [];
  constructor(private file = path.join(__dirname, '..', 'command_log.json')) {
    this.load();
  }

  log(side: string, data: Buffer): CommandLogEntry {
    const commandByte = data[0];
    const command = Command[commandByte as keyof typeof Command] || `0x${commandByte.toString(16)}`;
    const entry = {
      side,
      command,
      timestamp: Date.now(),
    };
    this.history.push(entry);
    this.save();
    return entry;
  }

  private load() {
    if (fs.existsSync(this.file)) {
      try {
        const data = fs.readFileSync(this.file, 'utf-8');
        this.history = JSON.parse(data);
      } catch {
        this.history = [];
      }
    }
  }

  private save() {
    fs.writeFileSync(this.file, JSON.stringify(this.history, null, 2));
  }
}

export const commandLogger = new CommandLogger();
