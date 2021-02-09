import Model, { attr } from '@ember-data/model';

export default class PublishableSessionModel extends Model {
  @attr() certificationCenterName;
  @attr() sessionDate;
  @attr() sessionTime;
  @attr() finalizedAt;

  get printableDateAndTime() {
    return (new Date(this.sessionDate)).toLocaleDateString('fr-FR') + ' à ' + this.sessionTime;
  }

  get printableFinalizationDate() {
    return (new Date(this.finalizedAt)).toLocaleDateString();
  }
}
