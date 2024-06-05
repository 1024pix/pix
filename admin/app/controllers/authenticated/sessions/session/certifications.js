import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const DEFAULT_PAGE_NUMBER = 1;
export default class ListController extends Controller {
  @service notifications;
  @service store;
  @service accessControl;

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;

  @tracked displayConfirm = false;
  @tracked confirmMessage = null;

  get canPublish() {
    const juryCertificationSummaries = this.model.juryCertificationSummaries;
    const { session } = this.model;

    return (
      !juryCertificationSummaries.some(
        (certification) => certification.status === 'error' && !certification.isCancelled,
      ) && session.isFinalized
    );
  }

  get sortedCertificationJurySummaries() {
    return this.model.juryCertificationSummaries
      .sortBy('numberOfCertificationIssueReportsWithRequiredAction')
      .reverse();
  }

  @action
  displayCertificationStatusUpdateConfirmationModal() {
    const sessionIsPublished = this.model.session.isPublished;

    if (!this.canPublish && !sessionIsPublished) return;

    this.confirmMessage = sessionIsPublished
      ? 'Souhaitez-vous dépublier la session ?'
      : 'Souhaitez-vous publier la session ?';
    this.displayConfirm = true;
  }

  @action
  async toggleSessionPublication() {
    const isPublished = this.model.session.isPublished;
    if (isPublished) {
      await this.unpublishSession();
    } else {
      await this.publishSession();
    }
  }

  async unpublishSession() {
    try {
      await this.model.session.save({ adapterOptions: { updatePublishedCertifications: true, toPublish: false } });
      await this.model.juryCertificationSummaries.reload();
      this.notifications.success('Les certifications ont été correctement dépubliées.');
    } catch (e) {
      this.notifyError(e);
    }
    this.hideConfirmationModal();
  }

  async publishSession() {
    try {
      await this.model.session.save({ adapterOptions: { updatePublishedCertifications: true, toPublish: true } });
    } catch (e) {
      this.notifyError(e);
      await this.forceRefreshModelFromBackend();
    }

    await this.model.juryCertificationSummaries.reload();
    if (this.model.session.isPublished) {
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
    await this.store.findRecord('session', this.model.session.id, { reload: true });
  }

  hideConfirmationModal() {
    this.displayConfirm = false;
  }

  @action
  onCancelConfirm() {
    this.displayConfirm = false;
  }
}
