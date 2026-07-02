import { service } from '@ember/service';
import Model, { attr, hasMany } from '@ember-data/model';

export const types = [
  { value: 'PRO', label: 'Organisation professionnelle' },
  { value: 'SCO', label: 'Établissement scolaire' },
  { value: 'SUP', label: 'Établissement supérieur' },
];

export default class CertificationCenter extends Model {
  @service intl;

  @attr() name;
  @attr() type;
  @attr() externalId;
  @attr() archivedAt;
  @attr() archivistFullName;
  @attr() createdAt;
  @attr() dataProtectionOfficerFirstName;
  @attr() dataProtectionOfficerLastName;
  @attr() dataProtectionOfficerEmail;

  @hasMany('complementary-certification', { async: true, inverse: null }) habilitations;
  @hasMany('certification-center-membership', { async: true, inverse: 'certificationCenter' })
  certificationCenterMemberships;

  @hasMany('certification-center-invitation', { async: true, inverse: null })
  certificationCenterInvitations;

  get typeLabel() {
    return types.find((type) => type.value === this.type).label;
  }

  get isArchived() {
    return Boolean(this.archivedAt);
  }

  get archivedAtFormatDate() {
    return this.archivedAt && this.intl.formatDate(this.archivedAt);
  }

  get dataProtectionOfficerFullName() {
    const fullName = [];

    if (this.dataProtectionOfficerFirstName) fullName.push(this.dataProtectionOfficerFirstName);
    if (this.dataProtectionOfficerLastName) fullName.push(this.dataProtectionOfficerLastName);

    return fullName.join(' ');
  }
}
