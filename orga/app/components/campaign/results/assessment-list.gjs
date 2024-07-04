import { t } from 'ember-intl';

import TableHeader from '../../table/header';
import TablePaginationControl from '../../table/pagination-control';
import CampaignParticipationFilters from '../filter/participation-filters';
import CampaignAssessmentRow from '../results/assessment-row';

<template>
  <section ...attributes>
    <h3 class="screen-reader-only">{{t "pages.campaign-results.table.title"}}</h3>

    <CampaignParticipationFilters
      @campaign={{@campaign}}
      @selectedDivisions={{@selectedDivisions}}
      @selectedGroups={{@selectedGroups}}
      @selectedBadges={{@selectedBadges}}
      @selectedStages={{@selectedStages}}
      @searchFilter={{@searchFilter}}
      @rowCount={{@participations.meta.rowCount}}
      @isHiddenStatus={{true}}
      @onResetFilter={{@onResetFilter}}
      @onFilter={{@onFilter}}
    />

    <div class="panel">
      <table class="table content-text content-text--small">
        <colgroup class="table__column">
          <col />
          <col />
          {{#if @campaign.idPixLabel}}
            <col class="table__column--medium" />
          {{/if}}
          <col />
          {{#if @campaign.hasBadges}}
            <col />
          {{/if}}
        </colgroup>
        <thead>
          <tr>
            <TableHeader>{{t "pages.campaign-results.table.column.last-name"}}</TableHeader>
            <TableHeader>{{t "pages.campaign-results.table.column.first-name"}}</TableHeader>
            {{#if @campaign.hasExternalId}}
              <TableHeader>{{@campaign.idPixLabel}}</TableHeader>
            {{/if}}
            <TableHeader>{{t "pages.campaign-results.table.column.results.label"}}</TableHeader>
            {{#if @campaign.multipleSendings}}
              <TableHeader aria-label={{t "pages.campaign-results.table.column.ariaSharedResultCount"}}>
                {{t "pages.campaign-results.table.column.sharedResultCount"}}
              </TableHeader>
            {{/if}}
            {{#if @campaign.hasBadges}}
              <TableHeader>{{t "pages.campaign-results.table.column.badges"}}</TableHeader>
            {{/if}}
          </tr>
        </thead>

        {{#if @participations}}
          <tbody>
            {{#each @participations as |participation|}}
              <CampaignAssessmentRow
                @hasStages={{@campaign.hasStages}}
                @hasBadges={{@campaign.hasBadges}}
                @hasExternalId={{@campaign.hasExternalId}}
                @participation={{participation}}
                @campaignId={{@campaign.id}}
                @stages={{@campaign.stages}}
                @onClickParticipant={{@onClickParticipant}}
                @displayParticipationCount={{@campaign.multipleSendings}}
              />
            {{/each}}
          </tbody>
        {{/if}}
      </table>

      {{#unless @participations}}
        <p class="table__empty content-text">{{t "pages.campaign-results.table.empty"}}</p>
      {{/unless}}
    </div>

    {{#if @participations}}
      <TablePaginationControl @pagination={{@participations.meta}} />
    {{/if}}
  </section>
</template>
