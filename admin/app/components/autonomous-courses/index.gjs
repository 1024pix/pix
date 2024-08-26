import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';

<template>
  <header class="page-header">
    <h1 class="page-title">Tous les parcours autonomes</h1>
    <PixButtonLink @route="authenticated.autonomous-courses.new" @variant="secondary">
      Nouveau parcours autonome
    </PixButtonLink>
  </header>

  <main class="page-body">
    <section class="page-section">
      {{yield}}
    </section>
  </main>
</template>
