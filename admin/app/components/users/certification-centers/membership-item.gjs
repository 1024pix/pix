import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';

import MembershipItemActions from './membership-item-actions';
import MembershipItemRole from './membership-item-role';

export default class UsersCertificationCentersMembershipItemComponent extends Component {
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
    <PixTableColumn @context={{@context}}>
      <:header>
        {{t "components.users.certification-centers.memberships.table-headers.member-id"}}
      </:header>
      <:cell>
        {{@certificationCenterMembership.id}}
      </:cell>
    </PixTableColumn>
    <PixTableColumn @context={{@context}}>
      <:header>
        {{t "components.users.certification-centers.memberships.table-headers.center-id"}}
      </:header>
      <:cell>
        <LinkTo
          @route="authenticated.certification-centers.get"
          @model={{@certificationCenterMembership.certificationCenter.id}}
        >
          {{@certificationCenterMembership.certificationCenter.id}}
        </LinkTo>
      </:cell>
    </PixTableColumn>
    <PixTableColumn @context={{@context}} class="break-word">
      <:header>
        {{t "components.users.certification-centers.memberships.table-headers.center-name"}}
      </:header>
      <:cell>
        {{@certificationCenterMembership.certificationCenter.name}}
      </:cell>
    </PixTableColumn>
    <PixTableColumn @context={{@context}}>
      <:header>
        {{t "components.users.certification-centers.memberships.table-headers.center-type"}}
      </:header>
      <:cell>
        {{@certificationCenterMembership.certificationCenter.type}}
      </:cell>
    </PixTableColumn>
    <PixTableColumn @context={{@context}} class="break-word">
      <:header>
        {{t "components.users.certification-centers.memberships.table-headers.center-external-id"}}
      </:header>
      <:cell>
        {{@certificationCenterMembership.certificationCenter.externalId}}
      </:cell>
    </PixTableColumn>
    <PixTableColumn @context={{@context}} class="break-word">
      <:header>
        {{t "components.users.certification-centers.memberships.table-headers.last-accessed-at"}}
      </:header>
      <:cell>
        {{#if @certificationCenterMembership.lastAccessedAt}}
          {{dayjsFormat @certificationCenterMembership.lastAccessedAt "DD/MM/YYYY"}}
        {{else}}
          {{t "components.users.certification-centers.memberships.no-last-connection-date-info"}}
        {{/if}}
      </:cell>
    </PixTableColumn>
    <PixTableColumn @context={{@context}}>
      <:header>
        {{t "components.users.certification-centers.memberships.table-headers.role-label"}}
      </:header>
      <:cell>
        <MembershipItemRole
          @isEditionMode={{this.isEditionMode}}
          @certificationCenterRoles={{this.certificationCenterRoles}}
          @role={{@certificationCenterMembership.role}}
          @roleLabelKey={{@certificationCenterMembership.roleLabelKey}}
          @onRoleSelected={{this.onRoleSelected}}
        />
      </:cell>
    </PixTableColumn>
    <PixTableColumn @context={{@context}}>
      <:header>
        {{t "components.users.certification-centers.memberships.table-headers.actions-label"}}
      </:header>
      <:cell>
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
      </:cell>
    </PixTableColumn>
  </template>
}
