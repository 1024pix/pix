/* eslint-disable ember/no-computed-properties-in-native-classes*/

import Model, { attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default class Session extends Model {
  @attr() address;
  @attr() room;
  @attr('date-only') date;
  @attr() time;
  @attr() examiner;
  @attr() enrolledCandidatesCount;
  @attr() effectiveCandidatesCount;
  @attr() status;

  @computed('status')
  get statusLabel() {
    if (this.status === 'finalized') return 'Finalisée';
    if (this.status === 'processed') return 'Résultats transmis par Pix';
    return 'Créée';
  }
}
