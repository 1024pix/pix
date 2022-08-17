import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
export default class TargetProfileController extends Controller {
  @service notifications;

  @tracked isEditMode = false;
  @tracked displayConfirm = false;
  @tracked displaySimplifiedAccessPopupConfirm = false;
  @tracked isDownloadModalOpened = false;

  get isPublic() {
    return this.model.isPublic ? 'Oui' : 'Non';
  }

  get isOutdated() {
    return this.model.outdated ? 'Oui' : 'Non';
  }

  get isSimplifiedAccess() {
    return this.model.isSimplifiedAccess ? 'Oui' : 'Non';
  }

  get displayActionsSeparator() {
    return !this.model.isSimplifiedAccess || this.model.isNewFormat;
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
  async outdate() {
    this.toggleDisplayConfirm();
    try {
      await this.model.outdate();

      return this.notifications.success('Profil cible marqué comme obsolète.');
    } catch (responseError) {
      this._handleResponseError(responseError);
    }
  }

  @action
  async markTargetProfileAsSimplifiedAccess() {
    this.toggleDisplaySimplifiedAccessPopupConfirm();
    try {
      this.model.isSimplifiedAccess = true;
      await this.model.save({ adapterOptions: { markTargetProfileAsSimplifiedAccess: true } });

      this.notifications.success('Ce profil cible a bien été marqué comme accès simplifié.');
    } catch (responseError) {
      this.notifications.error('Une erreur est survenue.');
    }
  }

  @action
  openDownloadModal() {
    this.isDownloadModalOpened = true;
  }

  get targetProfileContent() {
    return this.model.tubesSelection.map((tube) => ({
      id: tube.id,
      level: tube.level,
      frameworkId: this._getTubeFrameworkId(tube.id),
      skills: this.model.skills.filter((skill) => skill.tubeId === tube.id).map((skill) => skill.id),
    }));
  }

  _getTubeFrameworkId(tubeId) {
    const tube = this.model.tubes.find(({ id }) => id === tubeId);
    const competence = this.model.competences.find(({ id }) => id === tube.competenceId);
    const area = this.model.areas.find(({ id }) => id === competence.areaId);
    return area.frameworkId;
  }

  @action
  closeDownloadModal() {
    this.isDownloadModalOpened = false;
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

  reset() {
    this.isEditMode = false;
  }
}
