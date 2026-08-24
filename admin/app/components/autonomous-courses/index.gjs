import { PixButtonLink } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

<template>
  <header>
    <h1>{{t "components.autonomous-courses.title"}}</h1>
    <PixButtonLink @route="authenticated.autonomous-courses.new" @variant="secondary">
      {{t "components.autonomous-courses.actions.new"}}
    </PixButtonLink>
  </header>

  <main class="page-body">
    <section class="page-section">
      {{yield}}
    </section>
  </main>
</template>
