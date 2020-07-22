import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class ErrorController extends Controller {
  @service intl;

  pageTitle = this.intl.t('navigation.error');
}

