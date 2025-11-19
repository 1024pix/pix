import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { fn } from '@ember/helper';
import pageTitle from 'ember-page-title/helpers/page-title';
import ListItems from 'pix-admin/components/organizations/list-items';
<template>
  {{pageTitle "Organisations"}}
  <header>
    <h1>Toutes les organisations</h1>
    {{#if @controller.accessControl.hasAccessToOrganizationActionsScope}}
      <div class="page-actions">
        <PixButtonLink @route="authenticated.organizations.new" @variant="secondary" @iconBefore="add">
          Nouvelle organisation
        </PixButtonLink>
      </div>
    {{/if}}
  </header>

  <main class="page-body">
    <section class="page-section organizations-list">
      <ListItems
        @organizations={{@model}}
        @id={{@controller.id}}
        @name={{@controller.name}}
        @type={{@controller.type}}
        @externalId={{@controller.externalId}}
        @triggerFiltering={{@controller.triggerFiltering}}
        @hideArchived={{@controller.hideArchived}}
        @toggleArchived={{fn (mut @controller.hideArchived)}}
        @showDetachColumn={{false}}
        @onResetFilter={{@controller.onResetFilter}}
      />
    </section>
  </main>
</template>
