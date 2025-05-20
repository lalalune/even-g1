import crc from 'crc';
import {
  Command,
  SubCommand,
  MicStatus,
  SilentModeStatus,
  BrightnessAuto,
  DashboardState,
  GlassesWearStatus,
} from './models';

export function constructStartAI(subcmd: SubCommand, param: Buffer = Buffer.alloc(0)): Buffer {
  return Buffer.concat([Buffer.from([Command.START_AI, subcmd]), param]);
}

export function constructMicCommand(enable: MicStatus): Buffer {
  return Buffer.from([Command.OPEN_MIC, enable]);
}

export function constructSilentMode(status: SilentModeStatus): Buffer {
  return Buffer.from([Command.SILENT_MODE, status, 0x00]);
}

export function constructBrightness(level: number, auto: BrightnessAuto): Buffer {
  if (level < 0x00 || level > 0x29) {
    throw new Error('Brightness level must be between 0x00 and 0x29');
  }
  return Buffer.from([Command.BRIGHTNESS, level, auto]);
}

export function constructDashboardShowState(state: DashboardState, position: number): Buffer {
  const stateValue = state === DashboardState.ON ? 0x01 : 0x00;
  return Buffer.from([
    Command.DASHBOARD_POSITION,
    0x07,
    0x00,
    0x01,
    0x02,
    stateValue,
    position,
  ]);
}

export function constructGlassesWearCommand(status: GlassesWearStatus): Buffer {
  return Buffer.from([Command.GLASSES_WEAR, status]);
}

export function crc32(buf: Buffer): number {
  return crc.crc32(buf) >>> 0;
}

export function divideImageData(image: Buffer): Buffer[] {
  const packetSize = 194;
  const packets: Buffer[] = [];
  for (let i = 0; i < image.length; i += packetSize) {
    packets.push(image.slice(i, i + packetSize));
  }
  return packets;
}

export function constructBmpPacket(seq: number, packet: Buffer, first: boolean): Buffer {
  const header = first
    ? Buffer.from([Command.QUICK_NOTE, seq & 0xff, 0x00, 0x1c, 0x00, 0x00])
    : Buffer.from([Command.QUICK_NOTE, seq & 0xff]);
  return Buffer.concat([header, packet]);
}

export function constructPacketEnd(): Buffer {
  return Buffer.from([0x20, 0x0d, 0x0e]);
}

export function constructCrcCheck(image: Buffer): Buffer {
  const address = Buffer.from([0x00, 0x1c, 0x00, 0x00]);
  const crcBuf = Buffer.concat([address, image]);
  const crcVal = crc32(crcBuf);
  const crcBytes = Buffer.from([
    (crcVal >> 24) & 0xff,
    (crcVal >> 16) & 0xff,
    (crcVal >> 8) & 0xff,
    crcVal & 0xff,
  ]);
  return Buffer.concat([Buffer.from([0x16]), crcBytes]);
}
