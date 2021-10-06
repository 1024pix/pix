import Model, { attr, hasMany } from '@ember-data/model';

export const types = [
  { value: 'PRO', label: 'Organisation professionnelle' },
  { value: 'SCO', label: 'Établissement scolaire' },
  { value: 'SUP', label: 'Établissement supérieur' },
];

export default class CertificationCenter extends Model {
  @attr() name;
  @attr() type;
  @attr() externalId;

  @hasMany('accreditation') accreditations;
}
