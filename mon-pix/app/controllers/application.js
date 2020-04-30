import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class ApplicationController extends Controller {
  @service intl;

  pageTitle = this.intl.t('page-title.suffix');
}
