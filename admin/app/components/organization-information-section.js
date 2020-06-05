import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class OrganizationInformationSection extends Component {

  @tracked isEditMode = false;
  @tracked form;

  constructor() {
    super(...arguments);
    this._initForm();
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
  }

  @action
  cancel() {
    this.toggleEditMode();
    this._initForm();
  }

  _initForm() {
    this.form = {
      name: this.args.organization.name,
      externalId: this.args.organization.externalId,
      provinceCode: this.args.organization.provinceCode,
    };
  }
}
