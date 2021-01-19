import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';

import { tracked } from '@glimmer/tracking';

export default class NewController extends Controller {
  @service notifications;

  @tracked isFileInvalid = false;
  @tracked isSaving = false;

  @action
  goBackToTargetProfileList() {
    this.store.deleteRecord(this.model);

    this.transitionToRoute('authenticated.target-profiles.list');
  }

  @action
  saveFileObject(event) {
    const reader = new FileReader();

    reader.readAsText(event.target.files[0]);

    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target.result);
        const skillsId = json.flatMap((tube) => tube.skills);
        this.isFileInvalid = false;
        this.model.skillsId = skillsId;

      } catch (e) {
        this.isFileInvalid = true;
      }
    };
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
