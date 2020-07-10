import classic from 'ember-classic-decorator';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

@classic
export default class UserCertificationsController extends Controller {
  @service intl;

  pageTitle = this.intl.t('page-title.my-certifications');
}
