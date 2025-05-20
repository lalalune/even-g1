import { z } from 'zod';

export enum Command {
  START_AI = 0xf5,
  OPEN_MIC = 0x0e,
  MIC_RESPONSE = 0x0e,
  RECEIVE_MIC_DATA = 0xf1,
  INIT = 0x4d,
  HEARTBEAT = 0x25,
  SEND_RESULT = 0x4e,
  QUICK_NOTE = 0x21,
  DASHBOARD = 0x22,
  NOTIFICATION = 0x4b,
  SILENT_MODE = 0x03,
  BRIGHTNESS = 0x01,
  DASHBOARD_POSITION = 0x26,
  HEADUP_ANGLE = 0x0b,
  DASHBOARD_SHOW = 0x06,
  GLASSES_WEAR = 0x27,
}

export enum SubCommand {
  EXIT = 0x00,
  PAGE_CONTROL = 0x01,
  START = 0x17,
  STOP = 0x18,
  PUT_ON = 0x06,
  TAKEN_OFF = 0x07,
}

export enum MicStatus {
  ENABLE = 0x01,
  DISABLE = 0x00,
}

export enum ResponseStatus {
  SUCCESS = 0xc9,
  FAILURE = 0xca,
}

export enum ScreenAction {
  NEW_CONTENT = 0x01,
}

export enum AIStatus {
  DISPLAYING = 0x30,
  DISPLAY_COMPLETE = 0x40,
  MANUAL_MODE = 0x50,
  NETWORK_ERROR = 0x60,
}

export enum SilentModeStatus {
  OFF = 0x0a,
  ON = 0x0c,
}

export enum BrightnessAuto {
  OFF = 0x00,
  ON = 0x01,
}

export enum DashboardState {
  OFF,
  ON,
}

export enum GlassesWearStatus {
  OFF = 0x00,
  ON = 0x01,
}

export const RSVPConfigSchema = z.object({
  wpm: z.number().int().positive(),
  words_per_group: z.number().int().positive(),
  padding_char: z.string().length(1).default('-')
});
export type RSVPConfig = z.infer<typeof RSVPConfigSchema>;

export interface SendResultOptions {
  seq: number;
  total_packages: number;
  current_package: number;
  screen_status: number;
  new_char_pos0: number;
  new_char_pos1: number;
  page_number: number;
  max_pages: number;
  data: Buffer;
}

export class SendResult {
  constructor(private opts: SendResultOptions) {}

  build(): Buffer {
    const {
      seq,
      total_packages,
      current_package,
      screen_status,
      new_char_pos0,
      new_char_pos1,
      page_number,
      max_pages,
      data,
    } = this.opts;
    const header = Buffer.from([
      Command.SEND_RESULT,
      seq & 0xff,
      total_packages & 0xff,
      current_package & 0xff,
      screen_status & 0xff,
      new_char_pos0 & 0xff,
      new_char_pos1 & 0xff,
      page_number & 0xff,
      max_pages & 0xff,
    ]);
    return Buffer.concat([header, data]);
  }
}

export interface NCSNotification {
  title: string;
  content: string;
}
