import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class TargetProfile extends Component {
  @service notifications;
  @service router;

  @service fileSaver;
  @service session;
  @service intl;

  @tracked showCopyModal = false;
  @tracked displayConfirm = false;
  @tracked displaySimplifiedAccessPopupConfirm = false;
  @tracked displayPdfParametersModal = false;

  get isPublic() {
    return this.args.model.isPublic;
  }

  get isOutdated() {
    return this.args.model.outdated;
  }

  get isSimplifiedAccess() {
    return this.args.model.isSimplifiedAccess;
  }

  get areKnowledgeElementsResettable() {
    return this.args.model.areKnowledgeElementsResettable;
  }

  get hasLinkedCampaign() {
    return Boolean(this.args.model.hasLinkedCampaign);
  }

  get hasLinkedAutonomousCourse() {
    return Boolean(this.args.model.hasLinkedAutonomousCourse);
  }

  displayBooleanState = (bool) => (bool ? 'Oui' : 'Non');

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

  @action
  async downloadJSON() {
    try {
      const targetProfileId = this.args.model.id;
      const url = `/api/admin/target-profiles/${targetProfileId}/content-json`;
      const fileName = 'whatever.json';
      const token = this.session.data.authenticated.access_token;
      await this.fileSaver.save({ url, fileName, token });
    } catch (error) {
      this.notifications.error(error.message, { autoClear: false });
    }
  }

  @action
  async copyTargetProfile() {
    try {
      const newTargetProfileId = await this.args.model.copy(this.args.model.id);
      this.router.transitionTo('authenticated.target-profiles.target-profile', newTargetProfileId);
      this.notifications.success(this.intl.t('pages.target-profiles.copy.notifications.success'));
      this.showCopyModal = false;
    } catch (error) {
      this.notifications.error(error.message);
    }
  }

  @action
  closeCopyModal() {
    this.showCopyModal = false;
  }

  @action
  openCopyModal() {
    this.showCopyModal = true;
  }
}
