import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { pageTitle } from 'ember-page-title';
import TrainingBreadCrumb from 'pix-admin/components/trainings/breadcrumb';
import TrainingCreateOrUpdateTrainingForm from 'pix-admin/components/trainings/create-or-update-training-form';
import DeleteTrainingTrigger from 'pix-admin/components/trainings/delete-training-trigger';
import DuplicateTraining from 'pix-admin/components/trainings/duplicate-training';
import TrainingDetailsCard from 'pix-admin/components/trainings/training-details-card';

export default class Training extends Component {
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

  @action
  goToNewTrainingDetails(newTrainingId) {
    this.router.transitionTo('authenticated.trainings.training', newTrainingId);
  }

  <template>
    {{pageTitle "Détail du contenu formatif " @model.id}}

    {{! template-lint-disable no-redundant-role }}
    <header class="header page-header" role="banner">
      <TrainingBreadCrumb @currentPageLabel={{@model.id}} />

      <div class="page-actions">
        <a
          class="page-actions__link"
          href="https://1024pix.atlassian.net/wiki/spaces/PROD/pages/3753476097/Cr+er+un+contenu+formatif+Mode+d+emploi"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Consulter la documentation de création de contenus formatifs (ouverture dans une nouvelle fenêtre)"
        >
          Consulter la documentation
          <PixIcon @name="openNew" @ariaHidden={{true}} />
        </a>
      </div>
    </header>

    {{! template-lint-disable no-redundant-role }}
    <main class="page-body" role="main">
      <article class="page-section training-details-card">
        {{#if this.isEditMode}}
          <TrainingCreateOrUpdateTrainingForm
            @model={{@model}}
            @onSubmit={{this.updateTraining}}
            @onCancel={{this.toggleEditMode}}
          />
        {{else}}
          <TrainingDetailsCard @training={{@model}} />
          {{#if this.canEdit}}
            <div class="training-details-card__actions">
              <PixButton @size="small" @variant="primary" @triggerAction={{this.toggleEditMode}}>{{t
                  "common.actions.edit"
                }}
              </PixButton>
              <DuplicateTraining @onSubmit={{this.duplicateTraining}} />
              <DeleteTrainingTrigger @training={{@model}} @onSubmit={{this.deleteTrainingTrigger}} />
            </div>
          {{/if}}
        {{/if}}
      </article>

      <PixTabs
        @variant="primary"
        @ariaLabel="Navigation de la section détails d'un contenu formatif"
        class="navigation"
      >
        <LinkTo @route="authenticated.trainings.training.triggers" @model={{@model}}>
          {{t "pages.trainings.training.triggers.tabName"}}
        </LinkTo>
        <LinkTo @route="authenticated.trainings.training.target-profiles" @model={{@model}}>
          {{t "pages.trainings.training.targetProfiles.tabName"}}
        </LinkTo>
      </PixTabs>

      {{outlet}}
    </main>
  </template>
}
