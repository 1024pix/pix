import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

export default class TrainingDetailsTriggersController extends Controller {
  @service router;
  @service accessControl;

  get showTriggersEditForm() {
    return this.router.currentRoute.localName.includes('edit');
  }

  get canCreateTriggers() {
    return this.accessControl.hasAccessToTrainingsActionsScope;
  }
}
