import { PixTabs } from '@1024pix/nebulix-ember';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

<template>
  <PixTabs @variant='certif' @ariaLabel={{t 'pages.sessions.detail.tabs.aria-label'}}>
    <LinkTo @route='authenticated.sessions.details.parameters'>
      {{t 'pages.sessions.detail.tabs.details'}}
    </LinkTo>
    <LinkTo @route='authenticated.sessions.details.certification-candidates'>
      {{t 'common.sessions.candidates'}}
      {{@certificationCandidatesCount}}
    </LinkTo>
  </PixTabs>
</template>
