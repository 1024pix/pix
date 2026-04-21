import PixFilterBanner from '@1024pix/pix-ui/components/pix-filter-banner';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import { fn } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import MemberItem from './member-item';

export default class OrganizationTeamSection extends Component {
  @service intl;

  searchedFirstName = this.args.firstName;
  searchedLastName = this.args.lastName;
  searchedEmail = this.args.email;

  options = [
    { value: 'ADMIN', label: this.intl.t('common.roles.admin') },
    { value: 'MEMBER', label: this.intl.t('common.roles.member') },
  ];

  <template>
    {{! template-lint-disable require-input-label }}
    <section class="page-section organization-team-section">
      <header class="header page-section__header">
        <h2 class="page-section__title">Membres</h2>
      </header>

      <PixFilterBanner @title={{t "common.filters.title"}}>
        <PixInput
          aria-label="Rechercher par prénom"
          value={{this.searchedFirstName}}
          oninput={{fn @triggerFiltering "firstName"}}
        >
          <:label>Prénom</:label>
        </PixInput>
        <PixInput
          aria-label="Rechercher par nom"
          value={{this.searchedLastName}}
          oninput={{fn @triggerFiltering "lastName"}}
        >
          <:label>Nom</:label>
        </PixInput>
        <PixInput
          aria-label="Rechercher par adresse e-mail"
          value={{this.searchedEmail}}
          oninput={{fn @triggerFiltering "email"}}
        >
          <:label>Adresse e-mail</:label>
        </PixInput>
        <PixSelect
          @options={{this.options}}
          @value={{@organizationRole}}
          @onChange={{@selectRoleForSearch}}
          @placeholder="Tous"
          aria-label="Rechercher par rôle"
        >
          <:label>Rôle</:label>
        </PixSelect>
      </PixFilterBanner>

      {{#if @organizationMemberships}}
        <PixTable
          @variant="admin"
          @caption={{t "components.organizations.team-section.table.caption"}}
          @data={{@organizationMemberships}}
        >
          <:columns as |organizationMembership context|>
            <MemberItem @organizationMembership={{organizationMembership}} @context={{context}} />
          </:columns>
        </PixTable>

        <PixPagination @pagination={{@organizationMemberships.meta}} />
      {{else}}
        <div class="table__empty">{{t "common.tables.empty-result"}}</div>
      {{/if}}
    </section>
  </template>
}
