import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import MembershipItemActions from './membership-item-actions';
import MembershipItemRole from './membership-item-role';

export default class UsersCertificationCentersMembershipItemComponent extends Component {
  @service notifications;
  @service store;
  @service intl;

  @tracked isEditionMode = false;

  certificationCenterRoles = [
    { value: 'ADMIN', label: this.intl.t('common.roles.admin') },
    { value: 'MEMBER', label: this.intl.t('common.roles.member') },
  ];

  @action
  editMembershipRole() {
    this.isEditionMode = true;
  }

  @action
  onRoleSelected(role) {
    this.args.certificationCenterMembership.role = role;
  }

  @action
  saveMembershipRole() {
    this.isEditionMode = false;
    this.args.onCertificationCenterMembershipRoleChange(this.args.certificationCenterMembership);
  }

  @action
  cancelMembershipRoleEditing() {
    this.args.certificationCenterMembership.rollbackAttributes();
    this.isEditionMode = false;
  }

  <template>
    <tr
      aria-label="Informations du Centre de certification {{@certificationCenterMembership.certificationCenter.name}}"
    >
      <td>{{@certificationCenterMembership.id}}</td>
      <td class="table__column table__column--id">
        <LinkTo
          @route="authenticated.certification-centers.get"
          @model={{@certificationCenterMembership.certificationCenter.id}}
        >
          {{@certificationCenterMembership.certificationCenter.id}}
        </LinkTo>
      </td>
      <td>{{@certificationCenterMembership.certificationCenter.name}}</td>
      <td>{{@certificationCenterMembership.certificationCenter.type}}</td>
      <td>{{@certificationCenterMembership.certificationCenter.externalId}}</td>
      <td>
        <MembershipItemRole
          @isEditionMode={{this.isEditionMode}}
          @certificationCenterRoles={{this.certificationCenterRoles}}
          @role={{@certificationCenterMembership.role}}
          @roleLabelKey={{@certificationCenterMembership.roleLabelKey}}
          @onRoleSelected={{this.onRoleSelected}}
        />
      </td>
      <td>
        <MembershipItemActions
          @isEditionMode={{this.isEditionMode}}
          @onDeactivateMembershipButtonClicked={{fn
            @disableCertificationCenterMembership
            @certificationCenterMembership
          }}
          @onEditRoleButtonClicked={{this.editMembershipRole}}
          @onSaveRoleButtonClicked={{this.saveMembershipRole}}
          @onCancelButtonClicked={{this.cancelMembershipRoleEditing}}
        />
      </td>
    </tr>
  </template>
}
