import some from 'lodash/some';

import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { action, computed } from '@ember/object';

export default class ListController extends Controller {
  @service notifications;
  @service store;

  @tracked displayConfirm = false;
  @tracked confirmMessage = null;

  @computed('model.juryCertificationSummaries.@each.status')
  get canPublish() {
    return !some(this.model.juryCertificationSummaries.toArray(), (certif) =>
      ['error', 'started'].includes(certif.status)
    );
  }

  get sortedCertificationJurySummaries() {
    return this.model.juryCertificationSummaries
      .sortBy('numberOfCertificationIssueReportsWithRequiredAction')
      .reverse();
  }

  @action
  displayCertificationStatusUpdateConfirmationModal() {
    const sessionIsPublished = this.model.isPublished;

    if (!this.canPublish && !sessionIsPublished) return;

    const text = sessionIsPublished ? 'Souhaitez-vous dépublier la session ?' : 'Souhaitez-vous publier la session ?';

    this.confirmMessage = text;
    this.displayConfirm = true;
  }

  @action
  async toggleSessionPublication() {
    const isPublished = this.model.isPublished;
    if (isPublished) {
      await this.unpublishSession();
    } else {
      await this.publishSession();
    }
  }

  async unpublishSession() {
    try {
      await this.model.save({ adapterOptions: { updatePublishedCertifications: true, toPublish: false } });
      this.model.juryCertificationSummaries.reload();
      this.notifications.success('Les certifications ont été correctement dépubliées.');
    } catch (e) {
      this.notifyError(e);
    }
    this.hideConfirmationModal();
  }

  async publishSession() {
    try {
      await this.model.save({ adapterOptions: { updatePublishedCertifications: true, toPublish: true } });
    } catch (e) {
      this.notifyError(e);
      await this.forceRefreshModelFromBackend();
    }

    await this.model.juryCertificationSummaries.reload();
    if (this.model.isPublished) {
      this.notifications.success('Les certifications ont été correctement publiées.');
    }
    this.hideConfirmationModal();
  }

  notifyError(error) {
    if (error.errors && error.errors[0] && error.errors[0].detail) {
      const autoClear = error.errors[0].status != 503;
      this.notifications.error(error.errors[0].detail, { autoClear });
    } else {
      this.notifications.error(error);
    }
  }

  async forceRefreshModelFromBackend() {
    await this.store.findRecord('session', this.model.id, { reload: true });
  }

  hideConfirmationModal() {
    this.displayConfirm = false;
  }

  @action
  onCancelConfirm() {
    this.displayConfirm = false;
  }
}
