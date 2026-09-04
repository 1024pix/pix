import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncHasMany, attr, hasMany } from '@warp-drive/legacy/model';
import type {
  BooleanTransform,
  DateTransform,
  NumberTransform,
  StringTransform,
} from '@warp-drive/legacy/serializer/transform';

import type CampaignProfileCompetence from './campaign-profile-competence';

export default class CampaignProfile extends Model {
  declare [Type]: 'campaign-profile';

  @attr<StringTransform>('string') declare firstName: string | null;
  @attr<StringTransform>('string') declare lastName: string | null;
  @attr<NumberTransform>('number') declare campaignId: number | null;
  @attr<NumberTransform>('number') declare organizationLearnerId: number | null;
  @attr<StringTransform>('string') declare externalId: string | null;
  @attr<DateTransform>('date') declare createdAt: Date | null;
  @attr<DateTransform>('date') declare sharedAt: Date | null;
  @attr<BooleanTransform>('boolean') declare isShared: boolean | null;
  @attr<NumberTransform>('number') declare pixScore: number | null;
  @attr<NumberTransform>('number') declare certifiableCompetencesCount: number | null;
  @attr<NumberTransform>('number') declare competencesCount: number | null;
  @attr<BooleanTransform>('boolean') declare isCertifiable: boolean | null;

  @hasMany<CampaignProfileCompetence>('campaign-profile-competence', { async: true, inverse: null })
  declare competences: AsyncHasMany<CampaignProfileCompetence>;

  get sortedCompetences(): CampaignProfileCompetence[] {
    const competences = (this as CampaignProfile).hasMany('competences').value();

    if (competences === null) return [];

    return competences.slice().sort((a, b) => {
      return (a.index ?? '').localeCompare(b.index ?? '');
    });
  }
}
