import Component from '@glimmer/component';
import Object, { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { validator, buildValidations } from 'ember-cp-validations';
import { getOwner } from '@ember/application';
import { types } from '../../models/certification-center';

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
  type: {
    validators: [
      validator('presence', {
        presence: true,
        ignoreBlank: true,
        message: 'Le type ne peut pas être vide',
      }),
    ],
  },
  externalId: {
    validators: [
      validator('length', {
        min: 0,
        max: 255,
        message: "La longueur de l'identifiant externe ne doit pas excéder 255 caractères",
      }),
    ],
  },
});

class Form extends Object.extend(Validations) {
  @tracked name;
  @tracked externalId;
  @tracked type;
  @tracked accreditations;
}

export default class Information extends Component {
  @tracked isEditMode = false;

  certificationCenterTypes = types;

  constructor() {
    super(...arguments);
    this.form = Form.create(getOwner(this).ownerInjection());
  }

  @action
  enterEditMode() {
    this.isEditMode = !this.isEditMode;
    this._initForm();
  }

  @action
  exitEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  @action
  selectCertificationCenterType(event) {
    this.form.type = event.target.value;
  }

  @action
  async submitForm(event) {
    event.preventDefault();

    const { validations } = await this.form.validate();
    if (!validations.isValid) {
      return;
    }

    const certificationCenterData = {
      name: this.form.name.trim(),
      externalId: !this.form.externalId ? null : this.form.externalId.trim(),
      type: this.form.type.trim(),
      availableAccreditations: this.form.accreditations,
    };

    await this.args.updateCertificationCenter(certificationCenterData);
    this.exitEditMode();
  }

  @action
  updateGrantedAccreditation(accreditation) {
    const accreditations = this.form.accreditations;
    if (accreditations.includes(accreditation)) {
      this.form.accreditations.removeObject(accreditation);
    } else {
      this.form.accreditations.addObject(accreditation);
    }
  }

  _initForm() {
    const { accreditations, name, externalId, type } = this.args.certificationCenter.getProperties(
      'accreditations',
      'name',
      'externalId',
      'type'
    );

    this.form.name = name;
    this.form.accreditations = accreditations ? accreditations.toArray() : [];
    this.form.externalId = externalId;
    this.form.type = type;
  }
}
