import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import { optionsCategoryList } from '../../models/target-profile';

export default class UpdateTargetProfile extends Component {
  @service notifications;
  @service store;

  constructor() {
    super(...arguments);
    this.form = this.store.createRecord('target-profile-form');
    this.form.name = this.args.model.name;
    this.form.description = this.args.model.description || null;
    this.form.comment = this.args.model.comment || null;
    this.form.category = this.args.model.category || null;
    this.form.imageUrl = this.args.model.imageUrl || null;
    this.form.areKnowledgeElementsResettable = this.args.model.areKnowledgeElementsResettable;

    this.optionsList = this.optionsList = optionsCategoryList;
  }

  async _checkFormValidation() {
    const { validations } = await this.form.validate();
    return validations.isValid;
  }

  @action
  onCategoryChange(value) {
    this.form.category = value;
  }

  @action
  updateAreKnowledgeElementsResettableValue(event) {
    this.form.areKnowledgeElementsResettable = event.target.checked;
  }

  @action
  updateFormValue(key, event) {
    this.form[key] = event.target.value;
  }

  async _updateTargetProfile() {
    const model = this.args.model;
    model.name = this.form.name;
    model.description = this.form.description;
    model.comment = this.form.comment;
    model.category = this.form.category;
    model.imageUrl = this.form.imageUrl;
    model.areKnowledgeElementsResettable = this.form.areKnowledgeElementsResettable;

    try {
      await model.save();
      await this.notifications.success('Le profil cible a bien été mis à jour.');
      this.args.toggleEditMode();
    } catch (error) {
      model.rollbackAttributes();
      this.notifications.error('Une erreur est survenue.');
    }
  }

  @action
  async updateProfile(event) {
    event.preventDefault();
    if (await this._checkFormValidation()) {
      await this._updateTargetProfile();
    }
  }
}
