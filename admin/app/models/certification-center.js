import Model, { attr, hasMany } from '@ember-data/model';
import dayjs from 'dayjs';

export const types = [
  { value: 'PRO', label: 'Organisation professionnelle' },
  { value: 'SCO', label: 'Établissement scolaire' },
  { value: 'SUP', label: 'Établissement supérieur' },
];

export default class CertificationCenter extends Model {
  @attr() name;
  @attr() type;
  @attr() externalId;
  @attr() archivedAt;
  @attr() archivistFullName;
  @attr() dataProtectionOfficerFirstName;
  @attr() dataProtectionOfficerLastName;
  @attr() dataProtectionOfficerEmail;
  @attr() isComplementaryAlonePilot;

  @hasMany('complementary-certification', { async: true, inverse: null }) habilitations;

  get typeLabel() {
    return types.find((type) => type.value === this.type).label;
  }

  get isArchived() {
    return Boolean(this.archivedAt);
  }

  get archivedAtFormatDate() {
    return this.archivedAt && dayjs(this.archivedAt).format('DD/MM/YYYY');
  }

  get dataProtectionOfficerFullName() {
    const fullName = [];

    if (this.dataProtectionOfficerFirstName) fullName.push(this.dataProtectionOfficerFirstName);
    if (this.dataProtectionOfficerLastName) fullName.push(this.dataProtectionOfficerLastName);

    return fullName.join(' ');
  }
}
