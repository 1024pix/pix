import PixPagination from '@1024pix/pix-ui/components/pix-pagination';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

<template>
  {{#if @users}}
    <PixTable
      @variant="admin"
      @caption={{t "components.users.list-items.table.caption"}}
      @data={{@users}}
      class="table"
    >
      <:columns as |user context|>
        <PixTableColumn @context={{context}}>
          <:header>
            ID
          </:header>
          <:cell>
            <LinkTo @route="authenticated.users.get" @model={{user.id}}>
              {{user.id}}
            </LinkTo>
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            Prénom
          </:header>
          <:cell>
            <LinkTo @route="authenticated.users.get" @model={{user.id}}>
              {{user.firstName}}
            </LinkTo>
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            Nom
          </:header>
          <:cell>
            <LinkTo @route="authenticated.users.get" @model={{user.id}}>
              {{user.lastName}}
            </LinkTo>
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}} class="break-word">
          <:header>
            Adresse e-mail
          </:header>
          <:cell>
            {{user.email}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            Identifiant
          </:header>
          <:cell>
            <LinkTo @route="authenticated.users.get" @model={{user.id}}>
              {{user.username}}
            </LinkTo>
          </:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>

    <PixPagination @pagination={{@users.meta}} />
  {{else}}
    <div class="table__empty">{{t "common.tables.empty-result"}}</div>
  {{/if}}
</template>
