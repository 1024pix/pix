import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';

import MembershipItemActions from './membership-item-actions';
import MembershipItemRole from './membership-item-role';

export default class CertificationCentersMembershipItemComponent extends Component {
  @tracked isEditionMode = false;

  @action
  editMembershipRole() {
    this.isEditionMode = true;
  }

  @action
  saveMembershipRole() {
    this.isEditionMode = false;
    this.args.onCertificationCenterMembershipRoleChange(this.args.certificationCenterMembership);
  }

  @action
  cancelMembershipRoleEditing() {
    const changedAttributes = this.args.certificationCenterMembership.changedAttributes();
    // hack to fix EmberData behaviour in integration testing
    const certificationCenterMembershipAttributesHaveChanged = changedAttributes.length && !!changedAttributes[0];
    const shouldRollbackCertificationCenterMembershipAttributes =
      this.args.certificationCenterMembership.hasDirtyAttributes && certificationCenterMembershipAttributesHaveChanged;

    if (shouldRollbackCertificationCenterMembershipAttributes) {
      this.args.certificationCenterMembership.rollbackAttributes();
    }

    this.isEditionMode = false;
  }

  @action
  onRoleSelected(role) {
    this.args.certificationCenterMembership.role = role;
  }

  <template>
    <tr
      aria-label="Informations du membre {{@certificationCenterMembership.user.firstName}} {{@certificationCenterMembership.user.lastName}}"
    >
      <td>
        <LinkTo @route="authenticated.users.get" @model={{@certificationCenterMembership.user.id}}>
          {{@certificationCenterMembership.user.id}}
        </LinkTo>
      </td>
      <td class="member-information">{{@certificationCenterMembership.user.firstName}}</td>
      <td class="member-information">{{@certificationCenterMembership.user.lastName}}</td>
      <td class="member-information">{{@certificationCenterMembership.user.email}}</td>
      <td class="member-information">
        <MembershipItemRole
          @isEditionMode={{this.isEditionMode}}
          @role={{@certificationCenterMembership.role}}
          @roleLabelKey={{@certificationCenterMembership.roleLabelKey}}
          @onRoleSelected={{this.onRoleSelected}}
        />
      </td>
      <td>
        {{dayjsFormat @certificationCenterMembership.createdAt "DD-MM-YYYY - HH:mm:ss"}}
      </td>
      <td>
        <MembershipItemActions
          @isEditionMode={{this.isEditionMode}}
          @onDeactivateMembershipButtonClicked={{fn
            @disableCertificationCenterMembership
            @certificationCenterMembership
          }}
          @onModifyRoleButtonClicked={{this.editMembershipRole}}
          @onSaveRoleButtonClicked={{this.saveMembershipRole}}
          @onCancelButtonClicked={{this.cancelMembershipRoleEditing}}
        />
      </td>
    </tr>
  </template>
}
