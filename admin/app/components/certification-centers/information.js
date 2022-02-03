import Component from '@glimmer/component';
// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import Object, { action, computed } from '@ember/object';
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
  @tracked isSupervisorAccessEnabled;
  @tracked habilitations;
}

export default class Information extends Component {
  @tracked isEditMode = false;

  certificationCenterTypes = types;

  @computed('args.availableHabilitations.@each.id')
  get availableHabilitations() {
    return this.args.availableHabilitations?.sortBy('id');
  }

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
      isSupervisorAccessEnabled: this.form.isSupervisorAccessEnabled,
      habilitations: this.form.habilitations,
    };

    await this.args.updateCertificationCenter(certificationCenterData);
    this.exitEditMode();
  }

  @action
  updateGrantedHabilitation(habilitation) {
    const habilitations = this.form.habilitations;
    if (habilitations.includes(habilitation)) {
      this.form.habilitations.removeObject(habilitation);
    } else {
      this.form.habilitations.addObject(habilitation);
    }
  }

  _initForm() {
    const { habilitations, name, externalId, type, isSupervisorAccessEnabled } =
      this.args.certificationCenter.getProperties(
        'habilitations',
        'name',
        'externalId',
        'type',
        'isSupervisorAccessEnabled'
      );

    this.form.name = name;
    this.form.habilitations = habilitations ? habilitations.toArray() : [];
    this.form.externalId = externalId;
    this.form.type = type;
    this.form.isSupervisorAccessEnabled = isSupervisorAccessEnabled;
  }
}
