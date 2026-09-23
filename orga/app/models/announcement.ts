import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';

export default class Announcement extends Model {
  declare [Type]: 'announcement';

  @attr() declare content: Record<string, string> | null;
}
