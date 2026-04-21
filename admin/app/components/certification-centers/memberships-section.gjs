import PixTable from '@1024pix/pix-ui/components/pix-table';
import { t } from 'ember-intl';

import MembershipItem from './membership-item';

<template>
  <section class="page-section">
    <header class="header page-section__header">
      <h2 class="page-section__title">Membres</h2>
    </header>

    {{#if @certificationCenterMemberships}}
      <PixTable
        @variant="admin"
        @caption={{t "components.memberships-section.table.caption"}}
        @data={{@certificationCenterMemberships}}
      >
        <:columns as |certificationCenterMembership context|>
          <MembershipItem
            @context={{context}}
            @certificationCenterMembership={{certificationCenterMembership}}
            @disableCertificationCenterMembership={{@disableCertificationCenterMembership}}
            @onCertificationCenterMembershipRoleChange={{@onCertificationCenterMembershipRoleChange}}
          />
        </:columns>
      </PixTable>
    {{else}}
      <div class="table__empty">{{t "common.tables.empty-result"}}</div>
    {{/if}}
  </section>
</template>
