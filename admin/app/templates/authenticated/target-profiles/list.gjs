import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { LinkTo } from '@ember/routing';
import ListSummaryItems from 'pix-admin/components/target-profiles/list-summary-items';
<template>
  <header>
    <h1>Tous les profils cibles</h1>
    <div class="page-actions">
      <LinkTo @route="authenticated.smart-random-simulator" class="page-actions__link">Accéder au simulateur Smart
        Random
      </LinkTo>
      <PixButtonLink @route="authenticated.target-profiles.new" @variant="secondary" @iconBefore="add">
        Nouveau profil cible
      </PixButtonLink>
    </div>
  </header>

  <main class="page-body-template">
    <section>
      <ListSummaryItems
        @summaries={{@model}}
        @id={{@controller.id}}
        @internalName={{@controller.internalName}}
        @categories={{@controller.categories}}
        @triggerFiltering={{@controller.triggerFiltering}}
        @onResetFilter={{@controller.onResetFilter}}
      />
    </section>
  </main>
</template>
