import { PixTable } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

import ListItem from './list-item';

<template>
  <PixTable
    @variant="admin"
    @caption={{t "components.organizations.network.children-list.table-name"}}
    @data={{@childOrganizations}}
  >
    <:columns as |childOrganization context|>
      <ListItem
        @childOrganization={{childOrganization}}
        @context={{context}}
        @onRefreshOrganizationChildren={{@onRefreshOrganizationChildren}}
      />
    </:columns>
  </PixTable>
</template>
