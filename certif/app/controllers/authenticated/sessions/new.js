import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class SessionsNewController extends Controller {
  @service intl;

  get session() {
    return this.model;
  }

  get pageTitle() {
    return this.intl.t('pages.sessions.new.extra-information');
  }
}
