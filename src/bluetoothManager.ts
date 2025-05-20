import noble, { Peripheral, Characteristic } from '@abandonware/noble';
import EventEmitter from 'events';
import { UART_SERVICE_UUID, UART_TX_CHAR_UUID, UART_RX_CHAR_UUID } from './serviceIdentifiers';

export class Glass extends EventEmitter {
  tx?: Characteristic;
  rx?: Characteristic;
  constructor(public side: 'left' | 'right', public peripheral: Peripheral) {
    super();
  }

  async init(): Promise<void> {
    await this.peripheral.connectAsync();
    const { characteristics } = await this.peripheral.discoverSomeServicesAndCharacteristicsAsync(
      [UART_SERVICE_UUID],
      [UART_TX_CHAR_UUID, UART_RX_CHAR_UUID]
    );
    for (const c of characteristics) {
      if (c.uuid === UART_TX_CHAR_UUID.replace(/-/g, '').toLowerCase()) {
        this.tx = c;
      }
      if (c.uuid === UART_RX_CHAR_UUID.replace(/-/g, '').toLowerCase()) {
        this.rx = c;
      }
    }
    if (this.rx) {
      this.rx.on('data', (data) => this.emit('data', data));
      await this.rx.subscribeAsync();
    }
  }

  async send(buf: Buffer): Promise<void> {
    if (!this.tx) throw new Error('TX characteristic not initialized');
    await this.tx.writeAsync(buf, false);
  }
}

export class GlassesManager {
  left_glass?: Glass;
  right_glass?: Glass;

  async scanAndConnect(): Promise<void> {
    await noble.startScanningAsync([UART_SERVICE_UUID], false);
    return new Promise((resolve) => {
      const onDiscover = async (p: Peripheral) => {
        if (p.advertisement.localName?.includes('Even-L')) {
          noble.removeListener('discover', onDiscover);
          await noble.stopScanningAsync();
          this.left_glass = new Glass('left', p);
          await this.left_glass.init();
          resolve();
        } else if (p.advertisement.localName?.includes('Even-R')) {
          noble.removeListener('discover', onDiscover);
          await noble.stopScanningAsync();
          this.right_glass = new Glass('right', p);
          await this.right_glass.init();
          resolve();
        }
      };
      noble.on('discover', onDiscover);
    });
  }
}
