import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class UserAccountController extends Controller {
  @service featureToggles;

  get isPixAppNewLayoutEnabled() {
    return this.featureToggles.featureToggles.isPixAppNewLayoutEnabled;
  }
}
