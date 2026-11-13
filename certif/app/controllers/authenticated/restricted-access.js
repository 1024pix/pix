import Controller from '@ember/controller';
import { service } from '@ember/service';
import { formatUtcDate } from 'pix-certif/helpers/format-utc-date';

export default class RestrictedAccessController extends Controller {
  @service intl;

  get certificationOpeningDate() {
    if (this.model.isAccessBlockedCollege) {
      return this.intl.t('pages.sco.restricted-access.title-access', {
        date: formatUtcDate(this.intl, this.model.pixCertifScoBlockedAccessDateCollege),
      });
    }

    if (this.model.isAccessBlockedLycee || this.model.isAccessBlockedAEFE || this.model.isAccessBlockedAgri) {
      return this.intl.t('pages.sco.restricted-access.title-access', {
        date: formatUtcDate(this.intl, this.model.pixCertifScoBlockedAccessDateLycee),
      });
    }

    return null;
  }
}
