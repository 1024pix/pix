import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { types } from '../../models/certification-center';

export default class InformationEdit extends Component {
  @service store;
  certificationCenterTypes = types;

  constructor() {
    super(...arguments);
    this.form = this.store.createRecord('certification-center-form');

    this._initForm();
  }

  get availableHabilitations() {
    return this.args.availableHabilitations?.sortBy('id');
  }

  @action
  selectCertificationCenterType(value) {
    this.form.set('type', value ? value.trim() : value);
  }

  @action
  updateIsV3Pilot(event) {
    this.form.set('isV3Pilot', event.target.checked);
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

  @action
  async updateCertificationCenter(event) {
    event.preventDefault();

    const { validations } = await this.form.validate();
    if (!validations.isValid) {
      return;
    }

    this.args.certificationCenter.set('name', this.form.name);
    this.args.certificationCenter.set('externalId', !this.form.externalId ? null : this.form.externalId);
    this.args.certificationCenter.set('type', this.form.type);
    this.args.certificationCenter.set('habilitations', this.form.habilitations);
    this.args.certificationCenter.set('dataProtectionOfficerFirstName', this.form.dataProtectionOfficerFirstName);
    this.args.certificationCenter.set('dataProtectionOfficerLastName', this.form.dataProtectionOfficerLastName);
    this.args.certificationCenter.set('dataProtectionOfficerEmail', this.form.dataProtectionOfficerEmail);
    this.args.certificationCenter.set('isV3Pilot', this.form.isV3Pilot);

    this.args.toggleEditMode();
    return this.args.onSubmit();
  }

  _initForm() {
    const properties = this.args.certificationCenter.getProperties(
      'habilitations',
      'name',
      'externalId',
      'type',
      'dataProtectionOfficerFirstName',
      'dataProtectionOfficerLastName',
      'dataProtectionOfficerEmail',
      'isV3Pilot',
    );
    this.form.setProperties(properties);
  }
}
