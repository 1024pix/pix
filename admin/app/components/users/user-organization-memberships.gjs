import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import formatDate from 'ember-intl/helpers/format-date';
import sortBy from 'lodash/sortBy';

import ActionsOnUsersRoleInOrganization from '../actions-on-users-role-in-organization';

export default class UserOrganizationMemberships extends Component {
  @service accessControl;

  get orderedOrganizationMemberships() {
    return sortBy(this.args.organizationMemberships, 'organizationName');
  }

  <template>
    <header class="header page-section__header">
      <h2 class="page-section__title">Organisations de l’utilisateur</h2>
    </header>

    {{#if this.orderedOrganizationMemberships}}
      <PixTable
        @variant="admin"
        @data={{this.orderedOrganizationMemberships}}
        @caption={{t "components.users.organizations.memberships.table.caption"}}
      >
        <:columns as |organizationMembership context|>
          <PixTableColumn @context={{context}}>
            <:header>
              Membre ID
            </:header>
            <:cell>
              {{organizationMembership.id}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              Orga ID
            </:header>
            <:cell>
              <LinkTo @route="authenticated.organizations.get" @model={{organizationMembership.organizationId}}>
                {{organizationMembership.organizationId}}
              </LinkTo>
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="break-word">
            <:header>
              Nom
            </:header>
            <:cell>
              {{organizationMembership.organizationName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              Type
            </:header>
            <:cell>
              {{organizationMembership.organizationType}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="break-word">
            <:header>
              Identifiant externe
            </:header>
            <:cell>
              {{organizationMembership.organizationExternalId}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="break-word">
            <:header>
              Dernier accès
            </:header>
            <:cell>
              {{#if organizationMembership.lastAccessedAt}}
                {{formatDate organizationMembership.lastAccessedAt}}
              {{else}}
                {{t "components.users.organizations.memberships.no-last-connection-date-info"}}
              {{/if}}
            </:cell>
          </PixTableColumn>
          <ActionsOnUsersRoleInOrganization @organizationMembership={{organizationMembership}} @context={{context}} />
        </:columns>
      </PixTable>
    {{else}}
      <div class="table__empty">Aucune organisation</div>
    {{/if}}
  </template>
}
