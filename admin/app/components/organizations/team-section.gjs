import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { fn } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import MemberItem from './member-item';

export default class OrganizationTeamSection extends Component {
  @service accessControl;

  searchedFirstName = this.args.firstName;
  searchedLastName = this.args.lastName;
  searchedEmail = this.args.email;

  options = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'MEMBER', label: 'Membre' },
  ];

  <template>
    {{! template-lint-disable require-input-label }}
    <section class="page-section">
      <header class="page-section__header">
        <h2 class="page-section__title">Membres</h2>
      </header>
      <div class="content-text content-text--small">
        <div class="table-admin">
          <table>
            <thead>
              <tr>
                <th class="table__column table__column--id">ID user</th>
                <th class="table__column table__column--wide">Prénom</th>
                <th class="table__column table__column--wide">Nom</th>
                <th class="table__column table__column--wide">Adresse e-mail</th>
                <th class="table__column">Rôle</th>
                {{#if this.accessControl.hasAccessToOrganizationActionsScope}}
                  <th class="table__column">Actions</th>
                {{/if}}
              </tr>
              <tr>
                <td class="table__column"></td>
                <td class="table__column table__column--wide">
                  <input
                    id="firstName"
                    type="text"
                    aria-label="Rechercher par prénom"
                    value={{this.searchedFirstName}}
                    oninput={{fn @triggerFiltering "firstName"}}
                    class="table-admin-input form-control"
                  />
                </td>
                <td class="table__column table__column--wide">
                  <input
                    id="lastName"
                    type="text"
                    aria-label="Rechercher par nom"
                    value={{this.searchedLastName}}
                    oninput={{fn @triggerFiltering "lastName"}}
                    class="table-admin-input form-control"
                  />
                </td>
                <td class="table__column table__column--wide">
                  <input
                    id="email"
                    type="text"
                    aria-label="Rechercher par adresse e-mail"
                    value={{this.searchedEmail}}
                    oninput={{fn @triggerFiltering "email"}}
                    class="table-admin-input form-control"
                  />
                </td>
                <td class="table__column">
                  <PixSelect
                    class="pix-select-in-table"
                    @options={{this.options}}
                    @value={{@organizationRole}}
                    @onChange={{@selectRoleForSearch}}
                    @placeholder="Tous"
                    @screenReaderOnly={{true}}
                  >
                    <:label>Rechercher par rôle</:label>
                  </PixSelect>
                </td>
                {{#if this.accessControl.hasAccessToOrganizationActionsScope}}
                  <td class="table__column"></td>
                {{/if}}
              </tr>
            </thead>

            {{#if @organizationMemberships}}
              <tbody>
                {{#each @organizationMemberships as |organizationMembership|}}
                  <tr aria-label="Membre">
                    <MemberItem @organizationMembership={{organizationMembership}} />
                  </tr>
                {{/each}}
              </tbody>
            {{/if}}
          </table>

          {{#unless @organizationMemberships}}
            <div class="table__empty">Aucun résultat</div>
          {{/unless}}
        </div>

        {{#if @organizationMemberships}}
          <PixPagination @pagination={{@organizationMemberships.meta}} />
        {{/if}}
      </div>
    </section>
  </template>
}
