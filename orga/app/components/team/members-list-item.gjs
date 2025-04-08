import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import DropdownIconTrigger from '../dropdown/icon-trigger';
import DropdownItem from '../dropdown/item';
import LeaveOrganizationModal from './leave-organization-modal';
import RemoveMemberModal from './remove-member-modal';

const ARIA_LABEL_MEMBER_TRANSLATION = 'pages.team-members.actions.select-role.options.member';
const ARIA_LABEL_ADMIN_TRANSLATION = 'pages.team-members.actions.select-role.options.admin';

export default class MembersListItem extends Component {
  @service currentUser;
  @service notifications;
  @service intl;
  @service session;

  @tracked organizationRoles = null;
  @tracked isEditionMode = false;
  @tracked isRemoveMembershipModalDisplayed = false;
  @tracked isLeaveOrganizationModalDisplayed = false;
  @tracked roleSelection = null;

  adminOption = {
    value: 'ADMIN',
    label: this.intl.t(ARIA_LABEL_ADMIN_TRANSLATION),
    disabled: false,
  };

  memberOption = {
    value: 'MEMBER',
    label: this.intl.t(ARIA_LABEL_MEMBER_TRANSLATION),
    disabled: false,
  };

  displayRoleByOrganizationRole = {
    ADMIN: this.intl.t(ARIA_LABEL_ADMIN_TRANSLATION),
    MEMBER: this.intl.t(ARIA_LABEL_MEMBER_TRANSLATION),
  };

  constructor() {
    super(...arguments);

    this.organizationRoles = [this.adminOption, this.memberOption];
    this.roleSelection = this.args.membership?.organizationRole;
  }

  get displayRole() {
    return this.displayRoleByOrganizationRole[this.args.membership.organizationRole];
  }

  get isNotCurrentUserMembership() {
    return this.currentUser.prescriber.id !== this.args.membership.user.get('id');
  }

  get currentUserOrganizationName() {
    return this.currentUser.organization.name;
  }

  @action
  setRoleSelection(value) {
    this.roleSelection = value;
  }

  @action
  toggleEditionMode() {
    this.isEditionMode = true;
  }

  @action
  async updateRoleOfMember(membership) {
    this.isEditionMode = false;
    membership.organizationRole = this.roleSelection;
    membership.organization = this.currentUser.organization;

    try {
      await membership.save();
      this.notifications.sendSuccess(this.intl.t('pages.team-members.notifications.change-member-role.success'));
    } catch {
      membership.rollbackAttributes();
      this.notifications.sendError(this.intl.t('pages.team-members.notifications.change-member-role.error'));
    }
  }

  @action
  cancelUpdateRoleOfMember() {
    this.isEditionMode = false;
    this.args.membership.rollbackAttributes();
  }

  @action
  displayRemoveMembershipModal() {
    this.isRemoveMembershipModalDisplayed = true;
  }

  @action
  displayLeaveOrganizationModal() {
    this.isLeaveOrganizationModalDisplayed = true;
  }

  @action
  closeRemoveMembershipModal() {
    this.isRemoveMembershipModalDisplayed = false;
  }

  @action
  closeLeaveOrganizationModal() {
    this.isLeaveOrganizationModalDisplayed = false;
  }

  @action
  async onRemoveButtonClicked() {
    try {
      const membership = this.args.membership;
      const memberFirstName = membership.user.get('firstName');
      const memberLastName = membership.user.get('lastName');

      await this.args.onRemoveMember(membership);
      this.notifications.sendSuccess(
        this.intl.t('pages.team-members.notifications.remove-membership.success', { memberFirstName, memberLastName }),
      );
    } catch {
      this.notifications.sendError(this.intl.t('pages.team-members.notifications.remove-membership.error'));
    } finally {
      this.closeRemoveMembershipModal();
    }
  }

  @action
  async onLeaveButtonClicked() {
    try {
      const membership = this.args.membership;
      await this.args.onLeaveOrganization(membership);
      this.notifications.sendSuccess(
        this.intl.t('pages.team-members.notifications.leave-organization.success', {
          organizationName: this.currentUserOrganizationName,
        }),
      );
      await this.session.waitBeforeInvalidation(5000);
      this.session.invalidate();
    } catch {
      this.notifications.sendError(this.intl.t('pages.team-members.notifications.leave-organization.error'));
    } finally {
      this.closeLeaveOrganizationModal();
    }
  }

  <template>
    <PixTableColumn @context={{@context}}>
      <:header>
        {{t "pages.team-members.table.column.last-name"}}
      </:header>
      <:cell>
        {{@membership.user.lastName}}
      </:cell>
    </PixTableColumn>

    <PixTableColumn @context={{@context}}>
      <:header>
        {{t "pages.team-members.table.column.first-name"}}
      </:header>
      <:cell>
        {{@membership.user.firstName}}
      </:cell>
    </PixTableColumn>

    <PixTableColumn @context={{@context}}>
      <:header>
        {{t "pages.team-members.table.column.organization-membership-role"}}
      </:header>
      <:cell>
        {{#unless this.isEditionMode}}
          {{this.displayRole}}
        {{/unless}}

        {{#if this.isEditionMode}}
          <PixSelect
            @screenReaderOnly={{true}}
            @hideDefaultOption={{true}}
            @placeholder="{{t 'pages.team-members.actions.select-role.label'}}"
            @onChange={{this.setRoleSelection}}
            @options={{this.organizationRoles}}
            @value={{this.roleSelection}}
          >
            <:label>{{t "pages.team-members.actions.select-role.label"}}</:label>
          </PixSelect>
        {{/if}}
      </:cell>
    </PixTableColumn>

    {{#if @displayManagingColumn}}
      <PixTableColumn @context={{@context}}>
        <:header>
          {{t "common.actions.global"}}
        </:header>
        <:cell>
          {{#unless this.isEditionMode}}
            {{#if this.currentUser.isAdminInOrganization}}
              {{#if this.isNotCurrentUserMembership}}
                <DropdownIconTrigger
                  @icon="moreVert"
                  @dropdownButtonClass="zone-edit-role__dropdown-button"
                  @dropdownContentClass="zone-edit-role__dropdown-content"
                  @ariaLabel={{t "pages.team-members.actions.manage"}}
                >
                  <DropdownItem @onClick={{this.toggleEditionMode}}>
                    {{t "pages.team-members.actions.edit-organization-membership-role"}}
                  </DropdownItem>
                  <DropdownItem @onClick={{fn this.displayRemoveMembershipModal @membership}}>
                    {{t "pages.team-members.actions.remove-membership"}}
                  </DropdownItem>
                </DropdownIconTrigger>
              {{else}}
                {{#if @isMultipleAdminsAvailable}}
                  <DropdownIconTrigger
                    @icon="moreVert"
                    @dropdownButtonClass="zone-edit-role__dropdown-button"
                    @dropdownContentClass="zone-edit-role__dropdown-content"
                    @ariaLabel={{t "pages.team-members.actions.manage"}}
                  >
                    <DropdownItem @onClick={{fn this.displayLeaveOrganizationModal @membership}}>
                      {{t "pages.team-members.actions.leave-organization"}}
                    </DropdownItem>
                  </DropdownIconTrigger>
                {{/if}}
              {{/if}}
            {{/if}}
          {{/unless}}

          {{#if this.isEditionMode}}
            <div class="organization-participant__align-element">
              <PixButton @triggerAction={{fn this.updateRoleOfMember @membership}} @size="small">
                {{t "pages.team-members.actions.save"}}
              </PixButton>
              <PixIconButton
                @iconName="close"
                @ariaLabel={{t "common.actions.cancel"}}
                @triggerAction={{this.cancelUpdateRoleOfMember}}
                @color="dark-grey"
              />
            </div>
          {{/if}}

          <RemoveMemberModal
            @firstName={{@membership.user.firstName}}
            @lastName={{@membership.user.lastName}}
            @isOpen={{this.isRemoveMembershipModalDisplayed}}
            @onSubmit={{this.onRemoveButtonClicked}}
            @onClose={{this.closeRemoveMembershipModal}}
          />
          <LeaveOrganizationModal
            @organizationName={{this.currentUserOrganizationName}}
            @isOpen={{this.isLeaveOrganizationModalDisplayed}}
            @onSubmit={{this.onLeaveButtonClicked}}
            @onClose={{this.closeLeaveOrganizationModal}}
          />
        </:cell>
      </PixTableColumn>
    {{/if}}
  </template>
}
