import Model, { attr } from '@ember-data/model';
import { memberAction } from 'ember-api-actions';

export default class ToBePublishedSessionModel extends Model {
  @attr() certificationCenterName;
  @attr('date-only') sessionDate;
  @attr() sessionTime;
  @attr() finalizedAt;

  get printableDateAndTime() {
    const formattedSessionDate = this.sessionDate.split('-').reverse().join('/');
    return formattedSessionDate + ' à ' + this.sessionTime;
  }

  get printableFinalizationDate() {
    return (new Date(this.finalizedAt)).toLocaleDateString('fr-FR');
  }

  publish = memberAction({
    path: 'publish',
    type: 'patch',
    urlType: 'updateRecord',
    after() {
      this.unloadRecord();
    },
  })
}
