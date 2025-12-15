import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { t } from 'ember-intl';
import CombinedCourseBlueprintListSummaryItems from 'pix-admin/components/combined-course-blueprints/list-summary-items';

<template>
  <div class="page">
    <header>
      <h1>{{t "components.combined-course-blueprints.list.title"}}</h1>
      <div class="page-actions">
        <PixButtonLink @route="authenticated.combined-course-blueprints.create" @variant="secondary" @iconBefore="add">
          {{t "components.combined-course-blueprints.create.title"}}
        </PixButtonLink>
      </div>
    </header>

    <main class="page-body">
      <section>
        <CombinedCourseBlueprintListSummaryItems @summaries={{@model}} />
      </section>
    </main>
  </div>
</template>
