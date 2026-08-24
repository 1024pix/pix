import { PixIcon, PixPagination, PixTable, PixTableColumn, PixTag, PixTooltip } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';
import getService from 'pix-orga/helpers/get-service';

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
    <PixTable
      @variant="orga"
      class="table"
      @data={{@missionLearners}}
      @caption={{t "pages.missions.mission.table.result.caption" missionName=@mission.name}}
    >
      <:columns as |missionLearner context|>
        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.missions.mission.table.result.headers.first-name"}}</:header>
          <:cell>{{missionLearner.firstName}}</:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.missions.mission.table.result.headers.last-name"}}</:header>
          <:cell>{{missionLearner.lastName}}</:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.missions.mission.table.result.headers.division"}}</:header>
          <:cell>
            {{missionLearner.division}}
          </:cell>
        </PixTableColumn>

        {{#each @mission.content.steps as |step index|}}
          <PixTableColumn @context={{context}}>
            <:header>
              <div class="organization-participant__align-element">
                {{t "pages.missions.mission.table.result.headers.step" (indexNumber index)}}

                <PixTooltip @id="tooltip-{{index}}" @isInline={{true}}>
                  <:triggerElement>
                    <PixIcon
                      @name="help"
                      @plainIcon={{true}}
                      class="mission-result-table__info-icon"
                      aria-describedby="tooltip-{{index}}"
                    />
                  </:triggerElement>

                  <:tooltip>
                    <p>{{step.name}}</p>
                  </:tooltip>
                </PixTooltip>
              </div>
            </:header>
            <:cell>
              {{t (displayableStepResult missionLearner index)}}
            </:cell>
          </PixTableColumn>
        {{/each}}

        {{#if @mission.content.dareChallenges}}
          <PixTableColumn @context={{context}}>
            <:header>{{t "pages.missions.mission.table.result.headers.dare-challenge"}}</:header>
            <:cell>
              {{t missionLearner.displayableDareResult}}
            </:cell>
          </PixTableColumn>
        {{/if}}

        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.missions.mission.table.result.headers.result"}}</:header>
          <:cell>
            {{#if missionLearner.result.global}}
              <PixTag @color={{getMissionResultColor missionLearner.result.global}}>{{t
                  missionLearner.displayableGlobalResult
                }}</PixTag>
            {{else}}
              {{t missionLearner.displayableGlobalResult}}
            {{/if}}
          </:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>

    {{#let (getService "service:locale") as |locale|}}
      <PixPagination @pagination={{@missionLearners.meta}} @locale={{locale.currentLanguage}} />
    {{/let}}
  {{else}}
    <div class="table__empty content-text">
      {{t "pages.missions.mission.table.result.no-data"}}
    </div>
  {{/if}}
</template>
