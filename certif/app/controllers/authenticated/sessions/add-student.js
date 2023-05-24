import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class SessionsAddStudentController extends Controller {
  @service url;

  get pageTitle() {
    return `Inscription des candidats | Session ${this.model.session.id} | Pix Certif`;
  }

  get supportUrl() {
    return this.url.supportUrl;
  }
}
