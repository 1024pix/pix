import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

@classic
export default class StartController extends Controller {
  @service currentUser;
  @service intl;

  pageTitle = this.intl.t('page-title.certifications-start');
}
