import { PixTableColumn } from '@1024pix/nebulix-ember';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

<template>
  <PixTableColumn @context={{@context}}>
    <:header>
      {{t "components.organizations.network.children-list.table-headers.id"}}
    </:header>
    <:cell>
      <LinkTo @route="authenticated.organizations.get" @model={{@childOrganization.id}}>
        {{@childOrganization.id}}
      </LinkTo>
    </:cell>
  </PixTableColumn>
  <PixTableColumn @context={{@context}} class="break-word">
    <:header>
      {{t "components.organizations.network.children-list.table-headers.name"}}
    </:header>
    <:cell>
      {{@childOrganization.name}}
    </:cell>
  </PixTableColumn>
  <PixTableColumn @context={{@context}} class="break-word">
    <:header>
      {{t "components.organizations.network.children-list.table-headers.external-id"}}
    </:header>
    <:cell>
      {{@childOrganization.externalId}}
    </:cell>
  </PixTableColumn>
</template>
