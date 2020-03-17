import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class OrganizationInformationSection extends Component {

  get isManagingStudents() {
    return this.args.organization.isManagingStudents ? 'Oui' : 'Non';
  }

  @action
  updateLogo(file) {
    return file.readAsDataURL().then((b64) => {
      this.args.organization.logoUrl = b64;
      return this.args.onLogoUpdated();
    });
  }
}
