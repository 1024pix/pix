import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { t } from 'ember-intl';

import Breadcrumb from '../layout/breadcrumb';

<template>
  <header>
    <Breadcrumb />
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
