import { PixButtonLink } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';
import pageTitle from 'ember-page-title/helpers/page-title';
import ListItems from 'pix-admin/components/networks/list-items';
import getService from 'pix-admin/helpers/get-service';

<template>
  {{pageTitle (t "pages.networks.list.page-title")}}
  <header>
    <h1>{{t "pages.networks.list.title"}}</h1>
    <div class="page-actions">
      {{#let (getService "service:access-control") as |accessControl|}}
        {{#if accessControl.hasAccessToNetworkActionsScope}}
          <PixButtonLink @route="authenticated.networks.new" @variant="secondary" @iconBefore="add">
            {{t "pages.networks.list.new-button"}}
          </PixButtonLink>
        {{/if}}
      {{/let}}
    </div>
  </header>

  <main class="page-body">
    <section class="page-section networks-list">
      <ListItems
        @networks={{@model}}
        @name={{@controller.name}}
        @triggerFiltering={{@controller.triggerFiltering}}
        @onResetFilter={{@controller.onResetFilter}}
      />
    </section>
  </main>
</template>
