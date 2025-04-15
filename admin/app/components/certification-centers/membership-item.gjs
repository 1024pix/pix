import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';

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
    <PixTableColumn @context={{@context}}>
      <:header>ID Utilisateur</:header>
      <:cell>
        <LinkTo @route="authenticated.users.get" @model={{@certificationCenterMembership.user.id}}>
          {{@certificationCenterMembership.user.id}}
        </LinkTo>
      </:cell>
    </PixTableColumn>
    <PixTableColumn @context={{@context}}>
      <:header>Prénom</:header>
      <:cell>
        {{@certificationCenterMembership.user.firstName}}
      </:cell>
    </PixTableColumn>
    <PixTableColumn @context={{@context}}>
      <:header>Nom</:header>
      <:cell>
        {{@certificationCenterMembership.user.lastName}}
      </:cell>
    </PixTableColumn>
    <PixTableColumn @context={{@context}} class="break-word">
      <:header>Adresse e-mail</:header>
      <:cell>
        {{@certificationCenterMembership.user.email}}
      </:cell>
    </PixTableColumn>
    <PixTableColumn @context={{@context}}>
      <:header>Date de rattachement</:header>
      <:cell>
        {{dayjsFormat @certificationCenterMembership.createdAt "DD-MM-YYYY - HH:mm:ss"}}
      </:cell>
    </PixTableColumn>
    <PixTableColumn @context={{@context}}>
      <:header>Rôle</:header>
      <:cell>
        <MembershipItemRole
          @isEditionMode={{this.isEditionMode}}
          @role={{@certificationCenterMembership.role}}
          @roleLabelKey={{@certificationCenterMembership.roleLabelKey}}
          @onRoleSelected={{this.onRoleSelected}}
        />
      </:cell>
    </PixTableColumn>
    <PixTableColumn @context={{@context}}>
      <:header>Dernier accès</:header>
      <:cell>
        {{#if @certificationCenterMembership.lastAccessedAt}}
          {{dayjsFormat @certificationCenterMembership.lastAccessedAt "DD-MM-YYYY"}}
        {{else}}
          {{t "components.certification-centers.membership-item.no-last-connection-date-info"}}
        {{/if}}
      </:cell>
    </PixTableColumn>
    <PixTableColumn @context={{@context}}>
      <:header>Actions</:header>
      <:cell>
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
      </:cell>
    </PixTableColumn>
  </template>
}
