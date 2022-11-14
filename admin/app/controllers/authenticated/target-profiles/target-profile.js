import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class TargetProfileController extends Controller {
  @service router;

  get showTargetProfile() {
    return !['stage', 'badge'].includes(this.router.currentRoute.localName);
  }
}
