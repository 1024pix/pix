import Controller from '@ember/controller';

export default class SessionsAddStudentController extends Controller {
  get pageTitle() {
    return `Inscription des candidats | Session ${this.model.session.id} | Pix Certif`;
  }
}
