import { PixButtonLink } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

import AdministrationBlockLayout from '../block-layout';

<template>
  <AdministrationBlockLayout
    @title={{t "pages.administration.certification.sco-redirect-to-announcement.title"}}
    @description={{t "pages.administration.certification.sco-redirect-to-announcement.description"}}
  >
    <div>
      <PixButtonLink @route="authenticated.announcements">
        {{t "pages.administration.certification.sco-redirect-to-announcement.action"}}
      </PixButtonLink>
    </div>
  </AdministrationBlockLayout>
</template>
