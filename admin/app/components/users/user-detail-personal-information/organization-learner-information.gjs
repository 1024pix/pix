import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';
import { learnerDetailsMetabaseLink } from 'pix-admin/components/organization-learners/list-table';

export default class OrganizationLearnerInformation extends Component {
  @service accessControl;

  <template>
    <header class="page-section__header">
      <h2 class="page-section__title">{{t "components.organization-learner-information.title"}}</h2>
    </header>

    {{#if @user.organizationLearners}}
      <PixTable
        @variant="admin"
        @caption={{t "components.organization-learner-information.table.caption"}}
        @data={{@user.organizationLearners}}
      >
        <:columns as |organizationLearner context|>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "common.fields.id"}}
            </:header>
            <:cell>
              <a href={{learnerDetailsMetabaseLink organizationLearner.id}} target="_blank" rel="noreferrer noopener">
                <span
                  aria-label={{t
                    "components.organization-learners.list-table.view-learner"
                    learner=organizationLearner.fullName
                  }}
                >
                  {{organizationLearner.id}}
                </span>
              </a>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="break-word">
            <:header>
              {{t "components.organization-learner-information.table.columns.firstName"}}
            </:header>
            <:cell>
              {{organizationLearner.firstName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="break-word">
            <:header>
              {{t "components.organization-learner-information.table.columns.lastName"}}
            </:header>
            <:cell>
              {{organizationLearner.lastName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "components.organization-learner-information.table.columns.birthdate"}}
            </:header>
            <:cell>
              {{#if organizationLearner.birthdate}}
                {{formatDate organizationLearner.birthdate}}
              {{/if}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "components.organization-learner-information.table.columns.division-group"}}
            </:header>
            <:cell>
              {{if organizationLearner.division organizationLearner.division}}
              {{if organizationLearner.group organizationLearner.group}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="break-word">
            <:header>
              {{t "components.organization-learner-information.table.columns.organization"}}
            </:header>
            <:cell>
              <LinkTo @route="authenticated.organizations.get" @model={{organizationLearner.organizationId}}>
                {{organizationLearner.organizationName}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "components.organization-learner-information.table.columns.createdAt"}}
            </:header>
            <:cell>
              {{formatDate organizationLearner.createdAt}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "components.organization-learner-information.table.columns.updatedAt"}}
            </:header>
            <:cell>
              {{formatDate organizationLearner.updatedAt}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="table-admin-organization-learners-status">
            <:header>
              {{t "components.organization-learner-information.table.columns.active"}}
            </:header>
            <:cell>
              {{#if organizationLearner.isDisabled}}
                <PixIcon
                  @name="cancel"
                  @plainIcon={{true}}
                  @ariaHidden={{false}}
                  aria-label={{t "components.organization-learner-information.table.active.false"}}
                  class="organization-learners-table__status--isDisabled"
                />
              {{else}}
                <PixIcon
                  @name="checkCircle"
                  @plainIcon={{true}}
                  @ariaHidden={{false}}
                  aria-label={{t "components.organization-learner-information.table.active.true"}}
                  class="organization-learners-table__status--isEnabled"
                />
              {{/if}}
            </:cell>
          </PixTableColumn>
          {{#if this.accessControl.hasAccessToUsersActionsScope}}
            <PixTableColumn @context={{context}}>
              <:header>
                {{t "components.organization-learner-information.table.columns.actions"}}
              </:header>
              <:cell>
                {{#if organizationLearner.canBeDissociated}}
                  <PixButton
                    @triggerAction={{fn @toggleDisplayDissociateModal organizationLearner}}
                    @size="small"
                    @variant="error"
                  >
                    {{t "components.organization-learner-information.table.actions.dissociate"}}
                  </PixButton>
                {{/if}}

                {{#if this.accessControl.hasAccessToDeleteOrganizationLearnerScope}}
                  <PixIconButton
                    @triggerAction={{fn @toggleDisplayDeletionLearnerModal organizationLearner}}
                    @ariaLabel={{t "components.organization-learner-information.table.actions.delete"}}
                    @iconName="delete"
                  />
                {{/if}}
              </:cell>
            </PixTableColumn>
          {{/if}}
        </:columns>
      </PixTable>
    {{else}}
      <p class="table__empty">{{t "common.tables.empty-result"}}</p>
    {{/if}}
  </template>
}
