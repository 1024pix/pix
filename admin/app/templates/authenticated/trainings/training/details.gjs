import PixButton from '@1024pix/pix-ui/components/pix-button';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import TrainingCreateOrUpdateTrainingForm from 'pix-admin/components/trainings/create-or-update-training-form';
import DuplicateTraining from 'pix-admin/components/trainings/duplicate-training';
import TrainingDetailsCard from 'pix-admin/components/trainings/training-details-card';

export default class TrainingDetails extends Component {
  @service store;
  @service pixToast;
  @service accessControl;
  @service router;
  @service intl;

  @tracked isEditMode = false;

  get canEdit() {
    return this.accessControl.hasAccessToTrainingsActionsScope;
  }

  @action
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  @action
  async updateTraining(trainingFormData) {
    try {
      for (const key in trainingFormData) {
        this.args.model[key] = trainingFormData[key];
      }
      await this.args.model.save();
      this.pixToast.sendSuccessNotification({ message: 'Le contenu formatif a été mis à jour avec succès.' });
      this.toggleEditMode();
    } catch (error) {
      const errorStatus = error.errors?.[0]?.status;
      const errorMessage = error.errors?.[0]?.detail;

      let message = this.intl.t('common.notifications.generic-error');
      if (errorStatus === '400' && errorMessage.includes('data.attributes.editor-logo-url')) {
        message = this.intl.t('pages.trainings.training.error-messages.incorrect-editor-logo-url-format');
      }
      this.pixToast.sendErrorNotification({ message });
    }
  }

  @action
  async duplicateTraining() {
    try {
      const adapter = this.store.adapterFor('training');
      const { trainingId: newTrainingId } = await adapter.duplicate(this.args.model.id);
      this.goToNewTrainingDetails(newTrainingId);
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.trainings.training.duplicate.notifications.success'),
      });
    } catch (error) {
      error.errors.forEach((apiError) => {
        this.pixToast.sendErrorNotification({ message: apiError.detail });
      });
    }
  }

  @action
  goToNewTrainingDetails(newTrainingId) {
    this.router.transitionTo('authenticated.trainings.training', newTrainingId);
  }

  <template>
    {{#if this.isEditMode}}
      <TrainingCreateOrUpdateTrainingForm
        @model={{@model}}
        @onSubmit={{this.updateTraining}}
        @onCancel={{this.toggleEditMode}}
      />
    {{else}}
      {{#if this.canEdit}}
        <div class="training-details__actions">
          <PixButton @size="small" @triggerAction={{this.toggleEditMode}}>{{t "common.actions.edit"}}
          </PixButton>
          <DuplicateTraining @onSubmit={{this.duplicateTraining}} />
        </div>
      {{/if}}

      <TrainingDetailsCard @training={{@model}} />
    {{/if}}
  </template>
}
