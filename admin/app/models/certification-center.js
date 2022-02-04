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
  @attr('boolean') isSupervisorAccessEnabled;

  @hasMany('habilitation') habilitations;

  get typeLabel() {
    return types.find((type) => type.value === this.type).label;
  }

  get supervisorAccessLabel() {
    return this.isSupervisorAccessEnabled ? 'oui' : 'non';
  }
}
