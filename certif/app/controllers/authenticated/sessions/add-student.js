import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class SessionsAddStudentController extends Controller {
  @service url;
  @service intl;

  get pageTitle() {
    return `${this.intl.t('pages.sco.enrol-candidates-in-session.page-title')} | Session ${
      this.model.session.id
    } | Pix Certif`;
  }

  get supportUrl() {
    return this.url.supportUrl;
  }
}
