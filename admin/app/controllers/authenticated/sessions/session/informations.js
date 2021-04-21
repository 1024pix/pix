/* eslint-disable ember/no-computed-properties-in-native-classes */

import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { statusToDisplayName } from '../../../../models/session';

export default class IndexController extends Controller {
  @service notifications;
  @service currentUser;
  @service fileSaver;
  @service session;

  @alias('model') sessionModel;

  @tracked isShowingAssignmentModal = false;

  @tracked isCopyButtonClicked = false;
  @tracked copyButtonText = 'Copié';

  get sessionStatusLabel() {
    return statusToDisplayName[this.sessionModel.status];
  }

  get isCurrentUserAssignedToSession() {
    const currentUserId = this.currentUser.user.get('id');
    const assignedCertificationOfficerId = this.sessionModel.assignedCertificationOfficer.get('id');
    return assignedCertificationOfficerId != null
      && currentUserId === assignedCertificationOfficerId;
  }

  get isAssigned() {
    return this.sessionModel.assignedCertificationOfficer.get('id') ? true : false;
  }

  @action
  async tagSessionAsSentToPrescriber() {
    await this.sessionModel.save({ adapterOptions: { flagResultsAsSentToPrescriber: true } });
  }

  @action
  async checkForAssignment() {
    if (this.isAssigned) {
      this.isShowingAssignmentModal = true;
      return;
    }
    await this._assignSessionToCurrentUser();
  }

  @action
  cancelAssignment() {
    this.isShowingAssignmentModal = false;
  }

  @action
  async confirmAssignment() {
    await this._assignSessionToCurrentUser();
  }

  @action
  async copyResultsDownloadLink() {
    try {
      const link = await this.sessionModel.getDownloadLink();
      await navigator.clipboard.writeText(link);
      this._displaySuccessTooltip();
    } catch (err) {
      this._displayErrorTooltip();
    }
    window.setTimeout(() => this._hideTooltip(), 2000);
  }

  _displaySuccessTooltip() {
    this.copyButtonText = 'Copié';
    this.isCopyButtonClicked = true;
  }

  _displayErrorTooltip() {
    this.copyButtonText = 'Erreur !';
    this.isCopyButtonClicked = true;
  }

  _hideTooltip() {
    this.isCopyButtonClicked = false;
  }

  async _assignSessionToCurrentUser() {
    try {
      await this.sessionModel.save({ adapterOptions: { certificationOfficerAssignment: true } });
      this.notifications.success('La session vous a correctement été assignée');
    } catch (err) {
      this.notifications.error('Erreur lors de l\'assignation à la session');
    }
    this.isShowingAssignmentModal = false;
  }
}
