import { action } from '@ember/object';
import { service } from '@ember/service';
import Controller from '@ember/controller';

export default class AttachTargetProfileController extends Controller {
  @service router;

  @action
  async cancel() {
    this.router.transitionTo('authenticated.complementary-certifications.complementary-certification.details');
  }
}
