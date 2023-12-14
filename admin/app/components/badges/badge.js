import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class Badge extends Component {
  @service notifications;
  @service store;

  @tracked editMode = false;
  @tracked form = {};

  IMAGE_BASE_URL = 'https://images.pix.fr/badges/';

  get isCertifiableColor() {
    return this.args.badge.isCertifiable ? 'tertiary' : null;
  }

  get isAlwaysVisibleColor() {
    return this.args.badge.isAlwaysVisible ? 'tertiary' : null;
  }

  get isCertifiableText() {
    return this.args.badge.isCertifiable ? 'Certifiable' : 'Non certifiable';
  }

  get isAlwaysVisibleText() {
    return this.args.badge.isAlwaysVisible ? 'Lacunes' : null;
  }

  get imageName() {
    return this.args.badge.imageUrl.slice(this.IMAGE_BASE_URL.length);
  }

  @action
  async updateBadge(event) {
    event.preventDefault();

    try {
      const badgeDTO = {
        title: this.form.title,
        key: this.form.key,
        message: this.form.message,
        altMessage: this.form.altMessage,
        isCertifiable: this.form.isCertifiable,
        isAlwaysVisible: this.form.isAlwaysVisible,
        imageUrl: this.IMAGE_BASE_URL + this.form.imageName,
      };
      await this.args.onUpdateBadge(badgeDTO);
      this.notifications.success('Le résultat thématique a été mis à jour.');
      this.editMode = false;
    } catch (error) {
      console.error(error);
      this.notifications.error('Erreur lors de la mise à jour du résultat thématique.');
    }
  }

  @action
  cancel() {
    this.toggleEditMode();
  }

  @action
  toggleEditMode() {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this._initForm();
    }
  }

  _initForm() {
    this.form.title = this.args.badge.title;
    this.form.key = this.args.badge.key;
    this.form.message = this.args.badge.message;
    this.form.altMessage = this.args.badge.altMessage;
    this.form.isCertifiable = this.args.badge.isCertifiable;
    this.form.isAlwaysVisible = this.args.badge.isAlwaysVisible;
    this.form.imageName = this.imageName;
  }
}
