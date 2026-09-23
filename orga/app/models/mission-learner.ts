import type { MissionLearnerStatus, MissionResultStatus } from '@1024pix/pix-types';
import type { Type } from '@warp-drive/core/types/symbols';
import Model, { attr } from '@warp-drive/legacy/model';
import type { StringTransform } from '@warp-drive/legacy/serializer/transform';

export interface MissionLearnerResult {
  global?: MissionResultStatus;
  dare?: MissionResultStatus;
  steps?: MissionResultStatus[];
}

export default class MissionLearner extends Model {
  declare [Type]: 'mission-learner';

  @attr<StringTransform>('string') declare division: string | null;
  @attr<StringTransform>('string') declare firstName: string | null;
  @attr<StringTransform>('string') declare lastName: string | null;
  @attr<StringTransform>('string') declare organizationId: string | null;
  @attr<StringTransform>('string') declare missionStatus: MissionLearnerStatus | null;
  @attr() declare result: MissionLearnerResult | null;

  get displayableStatus(): string {
    return `pages.missions.mission.table.activities.mission-status.${this.missionStatus}`;
  }

  get displayableGlobalResult(): string {
    return `pages.missions.mission.table.result.mission-result.${this.result?.global}`;
  }

  get displayableDareResult(): string {
    return `pages.missions.mission.table.result.mission-dare-result.${this.result?.dare}`;
  }
}
