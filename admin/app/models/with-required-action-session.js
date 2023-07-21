import Model, { attr } from '@ember-data/model';
import dayjs from 'dayjs';

export default class WithRequiredActionSession extends Model {
  @attr() certificationCenterName;
  @attr('date-only') sessionDate;
  @attr() sessionTime;
  @attr() finalizedAt;
  @attr() assignedCertificationOfficerName;
  @attr() version;

  get printableDateAndTime() {
    const formattedSessionDate = this.sessionDate.split('-').reverse().join('/');
    return formattedSessionDate + ' à ' + this.sessionTime;
  }

  get printableFinalizationDate() {
    return dayjs(this.finalizedAt).format('DD/MM/YYYY');
  }
}
