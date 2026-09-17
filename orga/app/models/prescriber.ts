import type { LegalDocumentStatus, OrganizationFeatureKey } from '@1024pix/pix-types';
import type { Type } from '@warp-drive/core/types/symbols';
import Model, { type AsyncBelongsTo, type AsyncHasMany, attr, belongsTo, hasMany } from '@warp-drive/legacy/model';
import type { BooleanTransform, NumberTransform, StringTransform } from '@warp-drive/legacy/serializer/transform';

import type Membership from './membership';
import type UserOrgaSetting from './user-orga-setting';

export interface PrescriberFeatureState {
  active: boolean;
  params: Record<string, unknown> | null;
}

export default class Prescriber extends Model {
  declare [Type]: 'prescriber';

  @attr<StringTransform>('string') declare firstName: string | null;
  @attr<StringTransform>('string') declare lastName: string | null;
  @attr<StringTransform>('string') declare pixOrgaTermsOfServiceStatus: LegalDocumentStatus | null;
  @attr<StringTransform>('string') declare pixOrgaTermsOfServiceDocumentPath: string | null;
  @attr<BooleanTransform>('boolean') declare areNewYearOrganizationLearnersImported: boolean | null;
  @attr<NumberTransform>('number') declare participantCount: number | null;
  @attr<StringTransform>('string') declare lang: string | null;
  @attr() declare features: Partial<Record<OrganizationFeatureKey, PrescriberFeatureState>> | null;

  @hasMany<Membership>('membership', { async: true, inverse: null }) declare memberships: AsyncHasMany<Membership>;
  @belongsTo<UserOrgaSetting>('user-orga-setting', { async: true, inverse: null })
  declare userOrgaSettings: AsyncBelongsTo<UserOrgaSetting>;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get hasCurrentOrganizationWithGARAsIdentityProvider(): boolean {
    return this.userOrgaSettings.get('organization').get('identityProviderForCampaigns') === 'GAR';
  }

  get enableMultipleSendingAssessment(): boolean | undefined {
    return this.features?.['MULTIPLE_SENDING_ASSESSMENT']?.active;
  }

  get enableCampaignWithoutUserProfile(): boolean | undefined {
    return this.features?.['CAMPAIGN_WITHOUT_USER_PROFILE']?.active;
  }

  get computeOrganizationLearnerCertificability(): boolean | undefined {
    return this.features?.['COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY']?.active;
  }

  get placesManagement(): boolean | undefined {
    return this.features?.['PLACES_MANAGEMENT']?.active;
  }

  get attestationsManagement(): boolean | undefined {
    return this.features?.['ATTESTATIONS_MANAGEMENT']?.active;
  }

  get missionsManagement(): boolean | undefined {
    return this.features?.['MISSIONS_MANAGEMENT']?.active;
  }

  get isAdminOfTheCurrentOrganization(): boolean {
    const memberships = (this as Prescriber).hasMany('memberships').value() ?? [];
    const currentOrganizationId = this.userOrgaSettings.get('organization').get('id');

    return memberships.some(
      (membership) =>
        membership.get('organizationRole') === 'ADMIN' &&
        membership.get('organization').get('id') === currentOrganizationId,
    );
  }

  get hasOrganizationLearnerImport(): boolean | undefined {
    return this.features?.['LEARNER_IMPORT']?.active;
  }

  get hasOralizationFeature(): boolean | undefined {
    return this.features?.['ORALIZATION']?.active;
  }

  get hasParticipants(): boolean {
    return Boolean(this.participantCount);
  }

  get hasCoverRateFeature(): boolean | undefined {
    return this.features?.['COVER_RATE']?.active;
  }
}
