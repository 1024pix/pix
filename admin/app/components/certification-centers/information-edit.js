import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { types } from '../../models/certification-center';

export default class InformationEdit extends Component {
  @service store;
  @tracked habilitations = [];
  certificationCenterTypes = types;

  constructor() {
    super(...arguments);
    this.form = this.store.createRecord('certification-center-form');
    Promise.resolve(this.args.certificationCenter.habilitations).then((habilitations) => {
      this.habilitations = habilitations;
    });

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
  async updateGrantedHabilitation(habilitation) {
    const habilitations = await this.form.habilitations;
    if (habilitations.includes(habilitation)) {
      habilitations.removeObject(habilitation);
    } else {
      habilitations.addObject(habilitation);
    }
  }

  @action
  async updateCertificationCenter(event) {
    event.preventDefault();

    const { validations } = await this.form.validate();
    if (!validations.isValid) {
      return;
    }
    const habilitations = await this.form.habilitations;
    this.args.certificationCenter.set('name', this.form.name);
    this.args.certificationCenter.set('externalId', !this.form.externalId ? null : this.form.externalId);
    this.args.certificationCenter.set('type', this.form.type);
    this.args.certificationCenter.set('habilitations', habilitations);
    this.args.certificationCenter.set('dataProtectionOfficerFirstName', this.form.dataProtectionOfficerFirstName);
    this.args.certificationCenter.set('dataProtectionOfficerLastName', this.form.dataProtectionOfficerLastName);
    this.args.certificationCenter.set('dataProtectionOfficerEmail', this.form.dataProtectionOfficerEmail);
    this.args.certificationCenter.set('isV3Pilot', this.form.isV3Pilot);

    this.args.toggleEditMode();
    return this.args.onSubmit();
  }

  async _initForm() {
    const habilitations = await this.args.certificationCenter.habilitations;
    const properties = this.args.certificationCenter.getProperties(
      'name',
      'externalId',
      'type',
      'dataProtectionOfficerFirstName',
      'dataProtectionOfficerLastName',
      'dataProtectionOfficerEmail',
      'isV3Pilot',
    );
    this.form.setProperties({ ...properties, habilitations });
  }
}
