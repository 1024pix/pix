import { PixTabs } from '@1024pix/nebulix-ember';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

<template>
  <PixTabs @variant="primary" @ariaLabel={{t "pages.administration.navigation.aria-label"}} class="navigation">
    <LinkTo @route="authenticated.administration.common">
      {{t "pages.administration.navigation.common.label"}}
    </LinkTo>

    <LinkTo @route="authenticated.administration.campaigns">
      {{t "pages.administration.navigation.campaigns.label"}}
    </LinkTo>

    <LinkTo @route="authenticated.administration.organizations">
      {{t "pages.administration.navigation.organizations.label"}}
    </LinkTo>

    <LinkTo @route="authenticated.administration.certification">
      {{t "pages.administration.navigation.certification.label"}}
    </LinkTo>

    <LinkTo @route="authenticated.administration.deployment">
      {{t "pages.administration.navigation.deployment.label"}}
    </LinkTo>

    <LinkTo @route="authenticated.administration.access">
      {{t "pages.administration.navigation.access.label"}}
    </LinkTo>
  </PixTabs>
</template>
