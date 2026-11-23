import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class SessionsUpdateController extends Controller {
  @service intl;

  get session() {
    return this.model;
  }

  get pageTitle() {
    return `${this.intl.t('pages.sessions.update.title')} | Session ${this.session.id} | Pix Certif`;
  }
}
