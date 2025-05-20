import { GlassesManager } from './bluetoothManager';
import { SendResult, ScreenAction, AIStatus, RSVPConfig, RSVPConfigSchema, NCSNotification, SilentModeStatus, BrightnessAuto, DashboardState, GlassesWearStatus } from './models';
import { constructDashboardShowState, constructBrightness, constructSilentMode, constructGlassesWearCommand, constructBmpPacket, constructPacketEnd, constructCrcCheck, divideImageData } from './utils';
import { commandLogger } from './commandLogger';

export async function sendCommandToGlasses(manager: GlassesManager, buf: Buffer): Promise<void> {
  if (manager.left_glass) {
    commandLogger.log('left', buf);
    await manager.left_glass.send(buf);
  }
  if (manager.right_glass) {
    commandLogger.log('right', buf);
    await manager.right_glass.send(buf);
  }
}

export async function sendTextPacket(manager: GlassesManager, text: string, page_number = 1, max_pages = 1, screen_status = ScreenAction.NEW_CONTENT | AIStatus.DISPLAYING, seq = 0): Promise<void> {
  const buf = Buffer.from(text, 'utf-8');
  const result = new SendResult({
    seq,
    total_packages: 1,
    current_package: 0,
    screen_status,
    new_char_pos0: 0,
    new_char_pos1: 0,
    page_number,
    max_pages,
    data: buf,
  }).build();
  await sendCommandToGlasses(manager, result);
}

export async function sendText(manager: GlassesManager, text: string): Promise<void> {
  await sendTextPacket(manager, text);
}

export async function applySilentMode(manager: GlassesManager, status: SilentModeStatus): Promise<void> {
  const cmd = constructSilentMode(status);
  await sendCommandToGlasses(manager, cmd);
}

export async function applyBrightness(manager: GlassesManager, level: number, auto: BrightnessAuto): Promise<void> {
  const cmd = constructBrightness(level, auto);
  await sendCommandToGlasses(manager, cmd);
}

export async function showDashboard(manager: GlassesManager, position: number): Promise<void> {
  const cmd = constructDashboardShowState(DashboardState.ON, position);
  await sendCommandToGlasses(manager, cmd);
}

export async function hideDashboard(manager: GlassesManager, position: number): Promise<void> {
  const cmd = constructDashboardShowState(DashboardState.OFF, position);
  await sendCommandToGlasses(manager, cmd);
}

export async function applyGlassesWear(manager: GlassesManager, status: GlassesWearStatus): Promise<void> {
  const cmd = constructGlassesWearCommand(status);
  await sendCommandToGlasses(manager, cmd);
}

export async function sendImage(manager: GlassesManager, image: Buffer): Promise<void> {
  const packets = divideImageData(image);
  const full = Buffer.concat(packets);
  const packetBuffers = packets.map((p, i) => constructBmpPacket(i, p, i === 0));

  for (const pkt of packetBuffers) {
    await sendCommandToGlasses(manager, pkt);
  }
  await sendCommandToGlasses(manager, constructPacketEnd());
  await sendCommandToGlasses(manager, constructCrcCheck(full));
}

export async function sendNotification(manager: GlassesManager, notification: NCSNotification): Promise<void> {
  const text = `${notification.title}\n${notification.content}`;
  await sendText(manager, text);
}

export async function sendRsvp(manager: GlassesManager, text: string, config: RSVPConfig): Promise<void> {
  const parsed = RSVPConfigSchema.parse(config);
  const words = text.split(/\s+/);
  const delay = 60 / parsed.wpm;
  for (let i = 0; i < words.length; i += parsed.words_per_group) {
    const group = words.slice(i, i + parsed.words_per_group).join(' ');
    await sendText(manager, group);
    await new Promise((r) => setTimeout(r, delay * 1000));
  }
}
