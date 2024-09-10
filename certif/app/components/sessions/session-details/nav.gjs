import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

<template>
  <nav class='navbar session-details__controls-navbar-tabs'>
    <LinkTo @route='authenticated.sessions.details.parameters' class='navbar-item'>
      {{t 'pages.sessions.detail.tabs.details'}}
    </LinkTo>
    <LinkTo @route='authenticated.sessions.details.certification-candidates' class='navbar-item'>
      {{t 'common.sessions.candidates'}}
      {{@certificationCandidatesCount}}
    </LinkTo>
  </nav>
</template>
