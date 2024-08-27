import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { t } from 'ember-intl';

<template>
  <header class="page-header">
    <h1 class="page-title">{{t "components.autonomous-course.title"}}</h1>
    <PixButtonLink @route="authenticated.autonomous-courses.new" @variant="secondary">
      {{t "components.autonomous-course.actions.new"}}
    </PixButtonLink>
  </header>

  <main class="page-body">
    <section class="page-section">
      {{yield}}
    </section>
  </main>
</template>
