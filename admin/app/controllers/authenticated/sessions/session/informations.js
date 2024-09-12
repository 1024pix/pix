import Controller from '@ember/controller';
import { action } from '@ember/object';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { alias } from '@ember/object/computed';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { statusToDisplayName } from '../../../../models/session';

export default class IndexController extends Controller {
  @service notifications;
  @service currentUser;
  @service accessControl;
  @service session;
  @service fileSaver;
  @service intl;
  @service store;

  @alias('model') sessionModel;

  @tracked modalTitle = '';
  @tracked modalMessage = '';
  @tracked modalConfirmAction = this.cancelModal;
  @tracked isShowingModal = false;

  @tracked isCopyButtonClicked = false;
  @tracked copyButtonText = 'Copié';

  get sessionStatusLabel() {
    return statusToDisplayName[this.sessionModel.status];
  }

  get isCurrentUserAssignedToSession() {
    const currentUserId = this.currentUser.adminMember.get('userId');
    const assignedCertificationOfficerId = this.sessionModel.assignedCertificationOfficer.get('id');
    return assignedCertificationOfficerId != null && currentUserId == assignedCertificationOfficerId;
  }

  get isAssigned() {
    return this.sessionModel.assignedCertificationOfficer.get('id') ? true : false;
  }

  @action
  async tagSessionAsSentToPrescriber() {
    await this.sessionModel.save({ adapterOptions: { flagResultsAsSentToPrescriber: true } });
  }

  @action
  async unfinalizeSession() {
    try {
      await this.sessionModel.save({ adapterOptions: { unfinalize: true } });
      await this.sessionModel.reload();
      this.notifications.success('La session a bien été définalisée');
    } catch (err) {
      this.notifications.error('Erreur lors de la définalisation de la session');
    }
    this.cancelModal();
  }

  @action
  async onUnfinalizeSessionButtonClick() {
    this.modalTitle = '';
    this.modalMessage = this.intl.t('pages.sessions.informations.unfinalization-confirmation-modal');
    this.modalConfirmAction = this.unfinalizeSession;
    this.isShowingModal = true;
  }

  @action
  async checkForAssignment() {
    if (this.isAssigned) {
      this.modalTitle = 'Assignation de la session';
      this.modalMessage = this.intl.t('pages.sessions.informations.assignment-confirmation-modal', {
        fullName: this.sessionModel.assignedCertificationOfficer.get('fullName'),
        htmlSafe: true,
      });
      this.modalConfirmAction = this.confirmAssignment;
      this.isShowingModal = true;
      return;
    }
    await this._assignSessionToCurrentUser();
  }

  @action
  cancelModal() {
    this.isShowingModal = false;
    this.modalConfirmAction = this.cancelModal;
  }

  @action
  async confirmAssignment() {
    await this._assignSessionToCurrentUser();
    this.cancelModal();
  }

  @action
  async copyResultsDownloadLink() {
    try {
      const adapter = this.store.adapterFor('session');
      const link = await adapter.getDownloadLink({ id: this.model.id, lang: this.intl.primaryLocale });
      await navigator.clipboard.writeText(link.sessionResultsLink);
      this._displaySuccessTooltip();
    } catch (err) {
      this._displayErrorTooltip();
    }
    window.setTimeout(() => this._hideTooltip(), 2000);
  }

  @action
  async downloadPDFAttestations() {
    const sessionId = this.model.id;
    const url = `/api/admin/sessions/${sessionId}/attestations`;
    const token = this.session.data.authenticated.access_token;
    try {
      await this.fileSaver.save({ url, token });
    } catch (error) {
      this.notifications.error("Une erreur est survenue, les attestations n'ont pas pu être téléchargées.");
    }
  }

  @action
  async saveComment(comment) {
    try {
      await this.sessionModel.save({ adapterOptions: { isComment: true, comment } });
      this.sessionModel.reload();
    } catch (error) {
      this.notifications.error("Une erreur est survenue pendant l'enregistrement du commentaire. ");
    }
  }

  @action
  async deleteComment() {
    try {
      await this.sessionModel.save({ adapterOptions: { isDeleteComment: true } });
      await this.sessionModel.reload();
    } catch (error) {
      this.notifications.error('Une erreur est survenue pendant la suppression du commentaire.');
      throw error;
    }
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
      this.notifications.error("Erreur lors de l'assignation à la session");
    }
  }
}
