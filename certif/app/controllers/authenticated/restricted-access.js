import Controller from '@ember/controller';
import { service } from '@ember/service';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';

dayjs.extend(LocalizedFormat);
dayjs.extend(utc);

export default class RestrictedAccessController extends Controller {
  @service intl;

  get certificationOpeningDate() {
    if (this.model.isAccessBlockedCollege) {
      return this.intl.t('pages.sco.restricted-access.title-access', {
        date: dayjs.utc(this.model.pixCertifScoBlockedAccessDateCollege).format('L'),
      });
    }

    if (this.model.isAccessBlockedLycee || this.model.isAccessBlockedAEFE || this.model.isAccessBlockedAgri) {
      return this.intl.t('pages.sco.restricted-access.title-access', {
        date: dayjs.utc(this.model.pixCertifScoBlockedAccessDateLycee).format('L'),
      });
    }

    return null;
  }
}
