import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class RestrictedAccessController extends Controller {
  @service dayjs;
  @service intl;

  get certificationOpeningDate() {
    if (this.model.isAccessBlockedCollege) {
      return this.intl.t('pages.sco.restricted-access.title-access', {
        date: this.dayjs.self(this.model.pixCertifScoBlockedAccessDateCollege).format('L'),
      });
    }

    if (this.model.isAccessBlockedLycee || this.model.isAccessBlockedAEFE || this.model.isAccessBlockedAgri) {
      return this.intl.t('pages.sco.restricted-access.title-access', {
        date: this.dayjs.self(this.model.pixCertifScoBlockedAccessDateLycee).format('L'),
      });
    }

    return null;
  }
}
