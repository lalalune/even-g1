import { Glass } from './bluetoothManager';
import { commandLogger } from './commandLogger';

export function attachLogging(glass: Glass): void {
  glass.on('data', (data: Buffer) => {
    commandLogger.log(glass.side, data);
  });
}
