import Object, { action } from '@ember/object';
import { buildValidations, validator } from 'ember-cp-validations';
import Component from '@glimmer/component';
import { getOwner } from '@ember/application';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { optionsCategoryList } from '../../models/target-profile';

const Validations = buildValidations({
  name: {
    validators: [
      validator('presence', {
        presence: true,
        ignoreBlank: true,
        message: 'Le nom ne peut pas être vide',
      }),
      validator('length', {
        min: 1,
        max: 255,
        message: 'La longueur du nom ne doit pas excéder 255 caractères',
      }),
    ],
  },
  description: {
    validators: [
      validator('length', {
        max: 500,
        message: 'La longueur de la description ne doit pas excéder 500 caractères',
      }),
    ],
  },
  comment: {
    validators: [
      validator('length', {
        max: 500,
        message: 'La longueur du commentaire ne doit pas excéder 500 caractères',
      }),
    ],
  },
  category: {
    validators: [
      validator('presence', {
        presence: true,
      }),
    ],
  },
  imageUrl: {
    validators: [
      validator('presence', {
        presence: true,
        ignoreBlank: true,
        message: "L'url vers l'image ne peut pas être vide",
      }),
    ],
  },
});

class Form extends Object.extend(Validations) {
  @tracked name;
  @tracked description;
  @tracked comment;
  @tracked category;
  @tracked imageUrl;
}

export default class UpdateTargetProfile extends Component {
  @service notifications;

  constructor() {
    super(...arguments);
    this.form = Form.create(getOwner(this).ownerInjection());
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
