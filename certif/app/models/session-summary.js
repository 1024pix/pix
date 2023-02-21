import Model, { attr } from '@ember-data/model';

export default class SessionSummary extends Model {
  @attr() address;
  @attr() room;
  @attr('date-only') date;
  @attr() time;
  @attr() examiner;
  @attr() enrolledCandidatesCount;
  @attr() effectiveCandidatesCount;
  @attr() status;

  get hasEffectiveCandidates() {
    return this.effectiveCandidatesCount > 0;
  }
}
