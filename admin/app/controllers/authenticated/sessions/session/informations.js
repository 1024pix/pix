import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { statusToDisplayName } from '../../../../models/session';

export default class IndexController extends Controller {
  @service
  sessionInfoService;

  @service
  currentUser;

  @service
  notifications;

  @alias('model')
  session;

  @tracked isShowingAssignmentModal = false;

  @computed('session.status')
  get sessionStatusLabel() {
    return statusToDisplayName[this.session.status];
  }

  @computed('session')
  get isCurrentUserAssignedToSession() {
    const currentUserId = this.currentUser.user.get('id');
    const assignedUserid = this.session.assignedUser.get('id');
    return this.session.assignedUser ?
      currentUserId === assignedUserid
      : false;
  }

  @action
  downloadSessionResultFile() {
    try {
      this.sessionInfoService.downloadSessionExportFile(this.session);
    } catch (error) {
      this.notifications.error(error);
    }
  }

  @action
  downloadBeforeJuryFile() {
    try {
      this.sessionInfoService.downloadJuryFile(this.model.id, this.model.certifications);
    } catch (error) {
      this.notifications.error(error);
    }
  }

  @action
  async tagSessionAsSentToPrescriber() {
    await this.session.save({ adapterOptions: { flagResultsAsSentToPrescriber: true } });
  }

  @action
  async checkForAssignment() {
    if (this.session.assignedUser) {
      this.isShowingAssignmentModal = true;
      return;
    }
    try {
      await this._assignSessionToCurrentUser();
    }
    finally {
      this.isShowingAssignmentModal = false;
    }
  }

  @action
  cancelAssignment() {
    this.isShowingAssignmentModal = false;
  }

  @action
  async confirmAssignment() {
    try {
      await this._assignSessionToCurrentUser();
    }
    finally {
      this.isShowingAssignmentModal = false;
    }
  }

  async _assignSessionToCurrentUser() {
    try {
      await this.session.save({ adapterOptions: { userAssignment: true } });
      this.notifications.success('La session vous a correctement été assignée');
    } catch (err) {
      this.notifications.error('Erreur lors de l\'assignation à la session');
    }
  }
}
