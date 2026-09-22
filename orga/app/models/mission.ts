import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { StringTransform } from '@warp-drive/legacy/serializer/transform';

export interface MissionContent {
  steps?: { name: string }[];
  dareChallenges?: unknown[];
}

export default class Mission extends Model {
  declare [Type]: 'mission';

  @attr<StringTransform>('string') declare name: string | null;
  @attr<StringTransform>('string') declare competenceName: string | null;
  @attr<StringTransform>('string') declare startedBy: string | null;
  @attr<StringTransform>('string') declare learningObjectives: string | null;
  @attr<StringTransform>('string') declare documentationUrl: string | null;
  @attr() declare content: MissionContent | null;
}
