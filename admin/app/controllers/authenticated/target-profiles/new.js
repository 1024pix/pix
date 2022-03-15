import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

import { tracked } from '@glimmer/tracking';

export default class NewController extends Controller {
  @service notifications;
  @service store;

  @tracked isFileInvalid = false;
  @tracked isSaving = false;
  @tracked filename = '';

  @action
  goBackToTargetProfileList() {
    this.store.deleteRecord(this.model);

    this.transitionToRoute('authenticated.target-profiles.list');
  }

  @action
  saveFileObject(files) {
    const reader = new FileReader();

    reader.readAsText(files[0]);
    reader.onload = this._onFileLoad.bind(this);
    this.filename = files[0].name;
  }

  _onFileLoad(event) {
    try {
      const json = JSON.parse(event.target.result);
      const skillIds = json.flatMap((tube) => tube.skills);
      if (skillIds.length === 0) {
        throw new Error('Ce fichier ne contient aucun acquis !');
      }
      this.isFileInvalid = false;
      this.model.skillIds = skillIds;
    } catch (e) {
      this.isFileInvalid = true;
    }
  }

  @action
  async createTargetProfile(event) {
    event.preventDefault();

    if (this.isFileInvalid) return;

    try {
      this.isSaving = true;
      await this.model.save();

      this.notifications.success('Le profil cible a été créé avec succès.');
      this.transitionToRoute('authenticated.target-profiles.target-profile', this.model.id);
    } catch (error) {
      this.notifications.error('Une erreur est survenue.');
    }

    this.isSaving = false;
  }
}
