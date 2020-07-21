import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class ProfileController extends Controller {
  @service currentUser;
  @service intl;

  pageTitle = this.intl.t('pages.profile.title');
}
