import PixTag from '@1024pix/pix-ui/components/pix-tag';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip.js';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { t } from 'ember-intl';

import Header from '../table/header';
import PaginationControl from '../table/pagination-control';

function indexNumber(index) {
  return { number: index + 1 };
}

function displayableStepResult(missionLearner, missionStepIndex) {
  const resultStepLabel = missionLearner.result?.steps?.[missionStepIndex];

  return `pages.missions.mission.table.result.step-result.${resultStepLabel}`;
}

function getMissionResultColor(result) {
  return {
    reached: 'success',
    'not-reached': 'error',
    'partially-reach': 'secondary',
    exceeded: 'orga',
  }[result];
}

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
            {{#each @mission.content.steps as |step index|}}
              <Header scope="col">
                <div class="mission-result-table__header-cell">
                  {{t "pages.missions.mission.table.result.headers.step" (indexNumber index)}}

                  <PixTooltip @id="tooltip-{{index}}" @isInline={{true}}>
                    <:triggerElement>
                      <FaIcon
                        @icon="circle-info"
                        class="mission-result-table__info-icon"
                        aria-describedby="tooltip-{{index}}"
                      />
                    </:triggerElement>

                    <:tooltip>
                      <p>{{step.name}}</p>
                    </:tooltip>
                  </PixTooltip>
                </div>

              </Header>
            {{/each}}
            {{#if @mission.content.dareChallenges}}
              <Header scope="col">{{t "pages.missions.mission.table.result.headers.dare-challenge"}}</Header>
            {{/if}}
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
              {{#each @mission.content.steps as |missionStep index|}}
                <td>{{t (displayableStepResult missionLearner index)}}</td>
              {{/each}}
              <td>{{t missionLearner.displayableDareResult}}</td>
              <td>
                {{#if missionLearner.result.global}}
                  <PixTag @color={{getMissionResultColor missionLearner.result.global}}>{{t
                      missionLearner.displayableGlobalResult
                    }}</PixTag>
                {{else}}
                  {{t missionLearner.displayableGlobalResult}}
                {{/if}}
              </td>
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
