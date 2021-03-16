import Model, { attr } from '@ember-data/model';

export default class WithRequiredActionSession extends Model {
  @attr() certificationCenterName;
  @attr('date-only') sessionDate;
  @attr() sessionTime;
  @attr() finalizedAt;
  @attr() assignedCertificationOfficerName;

  get printableDateAndTime() {
    const formattedSessionDate = this.sessionDate.split('-').reverse().join('/');
    return formattedSessionDate + ' à ' + this.sessionTime;
  }

  get printableFinalizationDate() {
    return (new Date(this.finalizedAt)).toLocaleDateString('fr-FR');
  }
}
