import { PixButtonLink } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

import AdministrationBlockLayout from '../block-layout';

<template>
  <AdministrationBlockLayout
    @title={{t "pages.administration.sco-deployment.sco-announcement.title"}}
    @description={{t "pages.administration.sco-deployment.sco-announcement.description"}}
  >
    <PixButtonLink @route="authenticated.announcements">
      {{t "pages.administration.sco-deployment.sco-announcement.action"}}
    </PixButtonLink>
  </AdministrationBlockLayout>
</template>
