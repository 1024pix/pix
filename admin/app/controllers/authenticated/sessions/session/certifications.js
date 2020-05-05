import _ from 'lodash';

import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import { action, computed } from '@ember/object';

export default class ListController extends Controller {

  @service notifications;

  @tracked displayConfirm = false;
  @tracked confirmMessage = null;

  @computed('model.certifications.@each.status')
  get canPublish() {
    return !(_.some(
      this.model.certifications.toArray(),
      (certif) => ['error', 'started'].includes(certif.status)
    ));
  }

  @action
  displayCertificationStatusUpdateConfirmationModal() {
    const sessionIsPublished = this.model.isPublished;

    if (!this.canPublish && !sessionIsPublished) return;

    const text = sessionIsPublished
      ? 'Souhaitez-vous dépublier la session ?'
      : 'Souhaitez-vous publier la session ?';

    this.confirmMessage = text;
    this.displayConfirm = true;
  }

  @action
  async toggleSessionPublication() {
    const toPublish = !this.model.isPublished;
    const successText = toPublish
      ? 'Les certifications ont été correctement publiées.'
      : 'Les certifications ont été correctement dépubliées.';

    try {
      await this.model.save({ adapterOptions: { updatePublishedCertifications: true, toPublish } });
      this.model.certifications.reload();
      this.model.isPublished = toPublish;
      this.notifications.success(successText);
    } catch (error) {
      this.notifications.error(error);
    }
    this.displayConfirm = false;
  }

  @action
  onCancelConfirm() {
    this.displayConfirm = false;
  }
}
