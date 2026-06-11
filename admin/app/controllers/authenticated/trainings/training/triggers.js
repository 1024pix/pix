import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class TrainingDetailsTriggersController extends Controller {
  @service router;

  get showTriggersEditForm() {
    return this.router.currentRoute.localName.includes('edit');
  }
}
