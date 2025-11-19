import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import ListSummaryItems from 'pix-admin/components/trainings/list-summary-items';
<template>
  <header>
    <h1>Tous les contenus formatifs</h1>
    {{#if @controller.canCreateTrainings}}
      <div class="page-actions">
        <a
          class="page-actions__link"
          href="https://1024pix.atlassian.net/wiki/spaces/PROD/pages/3753476097/Cr+er+un+contenu+formatif+Mode+d+emploi"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Consulter la documentation de création de contenus formatifs (ouverture dans une nouvelle fenêtre)"
        >
          Consulter la documentation
          <PixIcon @name="openNew" @ariaHidden={{true}} />
        </a>
        <PixButtonLink @route="authenticated.trainings.new" @variant="secondary" @iconBefore="add">
          Nouveau contenu formatif
        </PixButtonLink>
      </div>
    {{/if}}
  </header>

  <main class="page-body">
    <section class="page-section page-with-table">
      <ListSummaryItems
        @summaries={{@model}}
        @id={{@controller.id}}
        @internalTitle={{@controller.internalTitle}}
        @triggerFiltering={{@controller.triggerFiltering}}
      />
    </section>
  </main>
</template>
