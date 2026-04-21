import ListSummaryItems from '../trainings/list-summary-items';

<template>
  <section class="page-section page-with-table">
    <header class="header page-section__header">
      <h2 class="page-section__title">Contenus Formatifs</h2>
    </header>

    <ListSummaryItems @summaries={{@trainingSummaries}} />
  </section>
</template>
