import { PixPagination, PixTable, PixTableColumn } from '@1024pix/nebulix-ember';
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
            {{user.firstName}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            Nom
          </:header>
          <:cell>
            {{user.lastName}}
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
            {{user.username}}
          </:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>

    <PixPagination @pagination={{@users.meta}} />
  {{else}}
    <div class="table__empty">{{t "common.tables.empty-result"}}</div>
  {{/if}}
</template>
