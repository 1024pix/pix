import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import CreateTrainingTriggers from 'pix-admin/components/trainings/create-training-triggers';
import DeleteTrainingTrigger from 'pix-admin/components/trainings/delete-training-trigger';

export default class TrainingTriggers extends Component {
  @service store;
  @service pixToast;
  @service accessControl;
  @service intl;
  @service router;

  get showTriggersEditForm() {
    return this.router.currentRoute.localName.includes('edit');
  }

  get canCreateTriggers() {
    return this.accessControl.hasAccessToTrainingsActionsScope;
  }

  @action
  async deleteTrainingTrigger(triggerId) {
    try {
      const adapter = this.store.adapterFor('training-trigger');
      await adapter.delete({ trainingId: this.args.model.id, triggerId });
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.trainings.training.delete.notifications.success'),
      });
      this.args.model.reload();
    } catch (error) {
      error.errors.forEach((apiError) => {
        this.pixToast.sendErrorNotification({ message: apiError.detail });
      });
    }
  }

  <template>
    {{#if this.showTriggersEditForm}}
      {{outlet}}
    {{else if this.canCreateTriggers}}
      <div class="training-trigger__actions">
        <DeleteTrainingTrigger @training={{@model}} @onSubmit={{this.deleteTrainingTrigger}} />
      </div>

      <CreateTrainingTriggers @training={{@model}} />
    {{/if}}
  </template>
}
