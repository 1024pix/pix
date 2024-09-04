import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

<template>
  <nav class="panel navbar campaign-list-header__tabs" aria-label={{t "pages.missions.mission.tabs.aria-label"}}>
    <ul>
      <li>
        <LinkTo @route="authenticated.missions.mission.activities" class="navbar-item">
          {{t "pages.missions.mission.tabs.activities"}}
        </LinkTo>
      </li>

      <li>
        <LinkTo @route="authenticated.missions.mission.results" class="navbar-item">
          {{t "pages.missions.mission.tabs.results"}}
        </LinkTo>
      </li>
    </ul>
  </nav>
</template>
