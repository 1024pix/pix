import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class AnalysisController extends Controller {
  @service currentUser;

  get isGARAuthenticationMethod() {
    return this.currentUser.isGARAuthenticationMethod;
  }
}
