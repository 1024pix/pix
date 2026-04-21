import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { t } from 'ember-intl';
import pageTitle from 'ember-page-title/helpers/page-title';
import ListItems from 'pix-admin/components/networks/list-items';

<template>
  {{pageTitle (t "pages.networks.list.page-title")}}
  <header class="header">
    <h1>{{t "pages.networks.list.title"}}</h1>
    <div class="page-actions">
      <PixButtonLink @route="authenticated.networks.new" @variant="secondary" @iconBefore="add">
        {{t "pages.networks.list.new-button"}}
      </PixButtonLink>
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
