import Model, { attr } from '@ember-data/model';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
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
