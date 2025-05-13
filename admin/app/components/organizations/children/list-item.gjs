import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

<template>
  <PixTableColumn @context={{@context}}>
    <:header>
      {{t "components.organizations.children-list.table-headers.id"}}
    </:header>
    <:cell>
      <LinkTo @route="authenticated.organizations.get" @model={{@organization.id}}>
        {{@organization.id}}
      </LinkTo>
    </:cell>
  </PixTableColumn>
  <PixTableColumn @context={{@context}} class="break-word">
    <:header>
      {{t "components.organizations.children-list.table-headers.name"}}
    </:header>
    <:cell>
      <LinkTo @route="authenticated.organizations.get" @model={{@organization.id}}>
        {{@organization.name}}
      </LinkTo>{{@organization.name}}
    </:cell>
  </PixTableColumn>
  <PixTableColumn @context={{@context}} class="break-word">
    <:header>
      {{t "components.organizations.children-list.table-headers.external-id"}}
    </:header>
    <:cell>
      {{@organization.externalId}}
    </:cell>
  </PixTableColumn>
</template>
