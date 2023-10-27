import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class Information extends Component {
  @service currentUser;

  get isMultipleCurrentTargetProfiles() {
    return this.args.complementaryCertification.currentTargetProfiles?.length > 1;
  }

  get hasAccessToAttachNewTargetProfile() {
    return this.currentUser.adminMember.isSuperAdmin;
  }
}
