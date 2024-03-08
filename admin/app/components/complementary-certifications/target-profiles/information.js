import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class Information extends Component {
  @service currentUser;

  get isMultipleCurrentTargetProfiles() {
    return this.args.complementaryCertification.currentTargetProfiles?.length > 1;
  }

  get hasAccessToAttachNewTargetProfile() {
    return this.currentUser.adminMember.isSuperAdmin;
  }
}
