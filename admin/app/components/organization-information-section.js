import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class OrganizationInformationSection extends Component {

  @tracked isEditMode = false;

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
}
