import Model, { attr } from '@warp-drive/legacy/model';

const CERTIFICATION_CENTER_TYPES = {
  SUP: 'SUP',
  SCO: 'SCO',
  PRO: 'PRO',
};

export default class AllowedCertificationCenterAccess extends Model {
  @attr() name;
  @attr() externalId;
  @attr() type;
  @attr() isRelatedToManagingStudentsOrganization;
  @attr() isAccessBlockedCollege;
  @attr() isAccessBlockedLycee;
  @attr() isAccessBlockedAEFE;
  @attr() isAccessBlockedAgri;
  @attr() relatedOrganizationTags;
  @attr() habilitations;
  @attr('date') pixCertifScoBlockedAccessDateLycee;
  @attr('date') pixCertifScoBlockedAccessDateCollege;

  get isSco() {
    return this.type === CERTIFICATION_CENTER_TYPES.SCO;
  }

  get isPro() {
    return this.type === CERTIFICATION_CENTER_TYPES.PRO;
  }

  get isSup() {
    return this.type === CERTIFICATION_CENTER_TYPES.SUP;
  }

  get isScoManagingStudents() {
    return this.type === CERTIFICATION_CENTER_TYPES.SCO && this.isRelatedToManagingStudentsOrganization;
  }

  get isAccessRestricted() {
    return (
      this.isAccessBlockedCollege || this.isAccessBlockedLycee || this.isAccessBlockedAEFE || this.isAccessBlockedAgri
    );
  }

  get hasHabilitations() {
    return this.habilitations.length > 0;
  }
}
