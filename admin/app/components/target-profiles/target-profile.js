import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class TargetProfile extends Component {
  @service notifications;

  @service fileSaver;
  @service session;

  @tracked isEditMode = false;
  @tracked displayConfirm = false;
  @tracked displaySimplifiedAccessPopupConfirm = false;
  @tracked displayPdfParametersModal = false;

  get isPublic() {
    return this.args.model.isPublic ? 'Oui' : 'Non';
  }

  get isOutdated() {
    return this.args.model.outdated ? 'Oui' : 'Non';
  }

  get isSimplifiedAccess() {
    return this.args.model.isSimplifiedAccess ? 'Oui' : 'Non';
  }

  get areKnowledgeElementsResettable() {
    return this.args.model.areKnowledgeElementsResettable ? 'Oui' : 'Non';
  }

  get hasLinkedCampaign() {
    return this.args.model.hasLinkedCampaign ? 'Oui' : 'Non';
  }

  @action
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  @action
  toggleDisplayConfirm() {
    this.displayConfirm = !this.displayConfirm;
  }

  @action
  toggleDisplaySimplifiedAccessPopupConfirm() {
    this.displaySimplifiedAccessPopupConfirm = !this.displaySimplifiedAccessPopupConfirm;
  }

  @action
  toggleDisplayPdfParametersModal() {
    this.displayPdfParametersModal = !this.displayPdfParametersModal;
  }

  @action
  async outdate() {
    this.toggleDisplayConfirm();
    try {
      await this.args.model.outdate();

      return this.notifications.success('Profil cible marqué comme obsolète.');
    } catch (responseError) {
      this._handleResponseError(responseError);
    }
  }

  @action
  async markTargetProfileAsSimplifiedAccess() {
    this.toggleDisplaySimplifiedAccessPopupConfirm();
    try {
      this.args.model.isSimplifiedAccess = true;
      await this.args.model.save({ adapterOptions: { markTargetProfileAsSimplifiedAccess: true } });

      this.notifications.success('Ce profil cible a bien été marqué comme accès simplifié.');
    } catch (responseError) {
      this.notifications.error('Une erreur est survenue.');
    }
  }

  _handleResponseError({ errors }) {
    if (!errors) {
      return this.notifications.error('Une erreur est survenue.');
    }
    errors.forEach((error) => {
      if (['404', '412'].includes(error.status)) {
        this.notifications.error(error.detail);
      }
      if (error.status === '400') {
        this.notifications.error('Une erreur est survenue.');
      }
    });
  }

  @action
  async downloadPDF(language) {
    try {
      this.toggleDisplayPdfParametersModal();
      const targetProfileId = this.args.model.id;
      const url = `/api/admin/target-profiles/${targetProfileId}/learning-content-pdf?language=${language}`;
      const fileName = 'whatever.pdf';
      const token = this.session.data.authenticated.access_token;
      await this.fileSaver.save({ url, fileName, token });
    } catch (error) {
      this.notifications.error(error.message, { autoClear: false });
    }
  }
}
