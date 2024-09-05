import { t } from 'ember-intl';

import Header from '../table/header';
import PaginationControl from '../table/pagination-control';

<template>
  {{#if @missionLearners}}
    <div class="panel">
      <table class="table content-text content-text--small participation-list__table">
        <caption class="screen-reader-only">{{t
            "pages.missions.mission.table.result.caption"
            missionName=@mission.name
          }}</caption>
        <thead>
          <tr>
            <Header scope="col">{{t "pages.missions.mission.table.result.headers.first-name"}}</Header>
            <Header scope="col">{{t "pages.missions.mission.table.result.headers.last-name"}}</Header>
            <Header scope="col">{{t "pages.missions.mission.table.result.headers.division"}}</Header>
            <Header scope="col">{{t "pages.missions.mission.table.result.headers.result"}}</Header>
          </tr>
        </thead>
        <tbody>

          {{#each @missionLearners as |missionLearner|}}
            <tr aria-label={{t "pages.missions.mission.tabs.result.aria-label"}}>
              <td>
                {{missionLearner.firstName}}
              </td>
              <td>
                {{missionLearner.lastName}}
              </td>
              <td>
                {{missionLearner.division}}
              </td>
              <td>{{t missionLearner.displayableResult}}</td>
            </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
    <PaginationControl @pagination={{@missionLearners.meta}} />
  {{else}}
    <div class="table__empty content-text">
      {{t "pages.missions.mission.table.result.no-data"}}
    </div>
  {{/if}}
</template>
