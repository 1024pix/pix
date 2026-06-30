import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

<template>
  {{#if @attachedOrganizations.length}}
    <PixTable
      @variant="admin"
      @caption={{t "components.certification-centers.attached-organizations.table.caption"}}
      @data={{@attachedOrganizations}}
    >
      <:columns as |attachedOrganization context|>
        <PixTableColumn @context={{context}}>
          <:header>{{t "components.certification-centers.attached-organizations.table.headers.id"}}</:header>
          <:cell>
            <LinkTo @route="authenticated.organizations.get" @model={{attachedOrganization.id}}>
              {{attachedOrganization.id}}
            </LinkTo>
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>{{t "components.certification-centers.attached-organizations.table.headers.name"}}</:header>
          <:cell>{{attachedOrganization.name}}</:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>{{t "components.certification-centers.attached-organizations.table.headers.external-id"}}</:header>
          <:cell>{{attachedOrganization.externalId}}</:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>
  {{else}}
    <p>{{t "components.certification-centers.attached-organizations.empty"}}</p>
  {{/if}}
</template>
