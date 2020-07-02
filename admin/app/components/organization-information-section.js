import Object, { action } from '@ember/object';
import ENV from 'pix-admin/config/environment';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { validator, buildValidations } from 'ember-cp-validations';
import { getOwner } from '@ember/application';

const Validations = buildValidations({
  name: {
    validators: [
      validator('presence', {
        presence: true,
        ignoreBlank: true,
        message: 'Le nom ne peut pas être vide'
      }),
      validator('length', {
        min: 1,
        max: 255,
        message: 'La longueur du nom ne doit pas excéder 255 caractères'
      })
    ]
  },
  externalId: {
    validators: [
      validator('length', {
        min: 0,
        max: 255,
        message: 'La longueur de l\'identifiant externe ne doit pas excéder 255 caractères'
      })
    ]
  },
  provinceCode: {
    validators: [
      validator('length', {
        min: 0,
        max: 255,
        message: 'La longueur du département ne doit pas excéder 255 caractères'
      })
    ]
  },
  email: {
    validators: [
      validator('length', {
        max: 255,
        message: 'La longueur de l\'email ne doit pas excéder 255 caractères.'
      }),
      validator('format', {
        allowBlank: true,
        type: 'email',
        message: 'L\'e-mail n\'a pas le bon format.'
      })
    ]
  },
});

class Form extends Object.extend(Validations) {
  @tracked name;
  @tracked externalId;
  @tracked provinceCode;
  @tracked email;
}

export default class OrganizationInformationSection extends Component {

  @tracked isEditMode = false;

  constructor() {
    super(...arguments);
    this.form = Form.create(getOwner(this).ownerInjection());
  }

  get externalURL() {
    const urlDashboardPrefix = ENV.APP.ORGANIZATION_DASHBOARD_URL;
    return urlDashboardPrefix && (urlDashboardPrefix + this.args.organization.id);
  }

  get isManagingStudents() {
    return this.args.organization.isManagingStudents ? 'Oui' : 'Non';
  }

  get canCollectProfiles() {
    return this.args.organization.canCollectProfiles ? 'Oui' : 'Non';
  }

  @action
  updateLogo(file) {
    return file.readAsDataURL().then((b64) => {
      this.args.organization.logoUrl = b64;
      return this.args.onLogoUpdated();
    });
  }

  @action
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
    this._initForm();
  }

  @action
  cancel() {
    this.toggleEditMode();
    this._initForm();
  }

  @action
  async updateOrganization(event) {
    event.preventDefault();

    const { validations } = await this.form.validate();
    if (!validations.isValid) {
      return;
    }
    this.args.organization.set('name', this.form.name.trim());
    this.args.organization.set('externalId', !this.form.externalId ? null : this.form.externalId.trim());
    this.args.organization.set('provinceCode', !this.form.provinceCode ? null : this.form.provinceCode.trim());
    this.args.organization.set('email', !this.form.email ? null : this.form.email.trim());

    this.isEditMode = false;
    return this.args.onSubmit();
  }

  _initForm() {
    this.form.name = this.args.organization.name;
    this.form.externalId = this.args.organization.externalId;
    this.form.provinceCode = this.args.organization.provinceCode;
    this.form.email = this.args.organization.email;

  }
}
