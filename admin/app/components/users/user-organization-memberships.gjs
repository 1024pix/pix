import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';

import ActionsOnUsersRoleInOrganization from '../actions-on-users-role-in-organization';

export default class UserOrganizationMemberships extends Component {
  @service accessControl;

  get orderedOrganizationMemberships() {
    return this.args.organizationMemberships.sortBy('organizationName');
  }

  <template>
    <header class="page-section__header">
      <h2 class="page-section__title">Organisations de l’utilisateur</h2>
    </header>
    <div class="content-text content-text--small">
      <div class="table-admin">
        <table>
          <thead>
            <tr>
              <th class="table__column table__column--id">Membre ID</th>
              <th>Orga ID</th>
              <th>Nom</th>
              <th>Type</th>
              <th>Identifiant externe</th>
              <th>Dernière modification</th>
              <th>Rôle</th>
              {{#if this.accessControl.hasAccessToOrganizationActionsScope}}
                <th>Actions</th>
              {{/if}}
            </tr>
          </thead>

          {{#if this.orderedOrganizationMemberships}}
            <tbody>
              {{#each this.orderedOrganizationMemberships as |organizationMembership|}}
                <tr>
                  <td>{{organizationMembership.id}}</td>
                  <td class="table__column table__column--id">
                    <LinkTo @route="authenticated.organizations.get" @model={{organizationMembership.organizationId}}>
                      {{organizationMembership.organizationId}}
                    </LinkTo>
                  </td>
                  <td>{{organizationMembership.organizationName}}</td>
                  <td>{{organizationMembership.organizationType}}</td>
                  <td>{{organizationMembership.organizationExternalId}}</td>
                  <td>{{dayjsFormat organizationMembership.updatedAt "DD/MM/YYYY [-] HH:mm"}}</td>
                  <ActionsOnUsersRoleInOrganization @organizationMembership={{organizationMembership}} />
                </tr>
              {{/each}}
            </tbody>
          {{/if}}
        </table>

      </div>
      {{#unless this.orderedOrganizationMemberships}}
        <div class="table__empty">Aucune organisation</div>
      {{/unless}}
    </div>
  </template>
}
