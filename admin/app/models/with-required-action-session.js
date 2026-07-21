import { service } from '@ember/service';
import Model, { attr } from '@warp-drive/legacy/model';

export default class WithRequiredActionSession extends Model {
  @service intl;

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
    return this.intl.formatDate(this.finalizedAt);
  }
}
