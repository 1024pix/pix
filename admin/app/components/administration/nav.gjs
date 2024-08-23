import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

<template>
  <nav aria-label={{t "pages.administration.navigation.aria-label"}} class="navbar">

    <LinkTo @route="authenticated.administration.common" class="navbar-item">
      {{t "pages.administration.navigation.common.label"}}
    </LinkTo>

    <LinkTo @route="authenticated.administration.campaigns" class="navbar-item">
      {{t "pages.administration.navigation.campaigns.label"}}
    </LinkTo>

    <LinkTo @route="authenticated.administration.certification" class="navbar-item">
      {{t "pages.administration.navigation.certification.label"}}
    </LinkTo>

    <LinkTo @route="authenticated.administration.deployment" class="navbar-item">
      {{t "pages.administration.navigation.deployment.label"}}
    </LinkTo>

    <LinkTo @route="authenticated.administration.access" class="navbar-item">
      {{t "pages.administration.navigation.access.label"}}
    </LinkTo>

  </nav>
</template>
