import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class TargetProfileController extends Controller {
  @service router;

  get showTargetProfile() {
    return !['stage', 'badge'].includes(this.router.currentRoute.localName);
  }
}
