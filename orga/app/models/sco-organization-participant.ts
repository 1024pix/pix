import type { CampaignParticipationStatus, CampaignType } from '@1024pix/pix-types';
import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncBelongsTo, attr, belongsTo } from '@warp-drive/legacy/model';
import type {
  BooleanTransform,
  DateTransform,
  NumberTransform,
  StringTransform,
} from '@warp-drive/legacy/serializer/transform';

import type DateOnlyTransform from '../transforms/date-only';
import type Organization from './organization';

export default class ScoOrganizationParticipant extends Model {
  declare [Type]: 'sco-organization-participant';

  @attr<StringTransform>('string') declare lastName: string | null;
  @attr<StringTransform>('string') declare firstName: string | null;
  @attr<DateOnlyTransform>('date-only') declare birthdate: string | null;
  @attr<StringTransform>('string') declare username: string | null;
  @attr<StringTransform>('string') declare email: string | null;
  @attr<StringTransform>('string') declare division: string | null;
  @attr<NumberTransform>('number') declare participationCount: number | null;
  @attr<DateTransform>('date') declare lastParticipationDate: Date | null;
  @attr<BooleanTransform>('boolean') declare isTemporarilyBlocked: boolean | null;
  @attr<BooleanTransform>('boolean') declare isBlocked: boolean | null;
  @attr<BooleanTransform>('boolean') declare isAuthenticatedFromGar: boolean | null;
  @attr<StringTransform>('string') declare campaignName: string | null;
  @attr<StringTransform>('string') declare campaignType: CampaignType | null;
  @attr<StringTransform>('string') declare participationStatus: CampaignParticipationStatus | null;
  @attr<BooleanTransform>('boolean', { allowNull: true }) declare isCertifiable: boolean | null;
  @attr<DateTransform>('date') declare certifiableAt: Date | null;

  @belongsTo('organization', { async: true, inverse: null }) declare organization: AsyncBelongsTo<Organization>;

  get hasUsername(): boolean {
    return Boolean(this.username);
  }

  get hasEmail(): boolean {
    return Boolean(this.email);
  }

  get authenticationMethods(): string[] {
    const messages = [];

    if (!this.isAssociated) return ['none'];

    if (this.hasEmail) messages.push('email');
    if (this.hasUsername) messages.push('identifiant');
    if (this.isAuthenticatedFromGar) messages.push('mediacentre');

    return messages;
  }

  get isAssociated(): boolean {
    return Boolean(this.hasEmail || this.hasUsername || this.isAuthenticatedFromGar);
  }

  get isAuthenticatedWithGarOnly(): boolean {
    return Boolean(!this.hasUsername && !this.hasEmail && this.isAuthenticatedFromGar);
  }

  get displayAddUsernameAuthentication(): boolean {
    return Boolean(!this.hasUsername && (this.isAuthenticatedFromGar || this.hasEmail));
  }

  get isBlockedOrTemporarilyBlocked(): boolean {
    return Boolean(this.isBlocked || this.isTemporarilyBlocked);
  }
}
