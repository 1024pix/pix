import { PixTabs } from '@1024pix/nebulix-ember';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

<template>
  <PixTabs @variant="orga" class="mission-navigation__tabs" @ariaLabel={{t "pages.missions.mission.tabs.aria-label"}}>
    <LinkTo @route="authenticated.missions.mission.activities">
      {{t "pages.missions.mission.tabs.activities"}}
    </LinkTo>
    <LinkTo @route="authenticated.missions.mission.results">
      {{t "pages.missions.mission.tabs.results"}}
    </LinkTo>
  </PixTabs>
</template>
