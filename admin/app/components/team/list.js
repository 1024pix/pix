import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { roles } from 'pix-admin/models/admin-member';

export default class List extends Component {
  @service notifications;

  @tracked editionMode = false;
  @tracked newRole;

  get adminRoles() {
    return Object.values(roles).map((role) => ({ value: role, label: role }));
  }

  @action
  async toggleEditionModeForThisMember(member) {
    member.isInEditionMode = true;
  }

  @action
  setAdminRoleSelection(event) {
    this.newRole = event.target.value;
  }

  @action
  async updateMemberRole(member) {
    const previousRole = member.role;
    member.role = this.newRole;
    try {
      await member.save();
      this.notifications.success(`${member.firstName} ${member.lastName} a désormais le rôle ${this.newRole}`);
    } catch (err) {
      const { detail } = err.errors?.[0] || {};
      this.notifications.error(detail);
      member.role = previousRole;
    } finally {
      member.isInEditionMode = false;
    }
  }
}
