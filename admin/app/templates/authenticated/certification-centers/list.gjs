import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import pageTitle from 'ember-page-title/helpers/page-title';
import ListItems from 'pix-admin/components/certification-centers/list-items';
<template>
  {{pageTitle "Centres de certification"}}
  <header>
    <h1>Tous les centres de certification</h1>
    <div class="page-actions">
      <PixButtonLink @route="authenticated.certification-centers.new" @variant="secondary" @iconBefore="add">
        Nouveau centre de certif
      </PixButtonLink>
    </div>
  </header>

  <main class="page-body">
    <section class="page-section">
      <ListItems
        @certificationCenters={{@model}}
        @id={{@controller.id}}
        @name={{@controller.name}}
        @type={{@controller.type}}
        @externalId={{@controller.externalId}}
        @triggerFiltering={{@controller.triggerFiltering}}
      />
    </section>
  </main>
</template>
