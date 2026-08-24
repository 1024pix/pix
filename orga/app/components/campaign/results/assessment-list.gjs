import { PixPagination, PixTable, PixTableColumn } from '@1024pix/nebulix-ember';
import { array, fn } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

import getService from '../../../helpers/get-service.js';
import MasteryPercentageDisplay from '../../ui/mastery-percentage-display';
import CampaignBadges from '../badges';
import CampaignParticipationFilters from '../filter/participation-filters';
import EvolutionHeader from './evolution-header';
import ParticipationEvolutionIcon from './participation-evolution-icon';

<template>
  <section>
    <h3 class="screen-reader-only">{{t "pages.campaign-results.table.title"}}</h3>

    <CampaignParticipationFilters
      @campaign={{@campaign}}
      @selectedDivisions={{@selectedDivisions}}
      @selectedGroups={{@selectedGroups}}
      @selectedBadges={{@selectedBadges}}
      @selectedUnacquiredBadges={{@selectedUnacquiredBadges}}
      @selectedStages={{@selectedStages}}
      @searchFilter={{@searchFilter}}
      @rowCount={{@participations.meta.rowCount}}
      @isHiddenStatus={{true}}
      @onResetFilter={{@onResetFilter}}
      @onFilter={{@onFilter}}
      @participantExternalIdLabel={{@campaign.externalIdLabel}}
      @participantExternalIdFilter={{@participantExternalIdFilter}}
    />

    <PixTable
      @variant="orga"
      @caption={{@caption}}
      @data={{@participations}}
      @onRowClick={{fn @onClickParticipant @campaign.id}}
      class="table"
    >
      <:columns as |participation context|>

        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.campaign-results.table.column.last-name"}}
          </:header>
          <:cell>
            <LinkTo
              @route="authenticated.campaigns.participant-assessment"
              @models={{array @campaign.id participation.id}}
            >
              {{participation.lastName}}
            </LinkTo>
          </:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.campaign-results.table.column.first-name"}}
          </:header>
          <:cell>
            {{participation.firstName}}
          </:cell>
        </PixTableColumn>

        {{#if @campaign.externalIdLabel}}
          <PixTableColumn @context={{context}}>
            <:header>
              {{@campaign.externalIdLabel}}
            </:header>
            <:cell>
              {{participation.participantExternalId}}
            </:cell>
          </PixTableColumn>
        {{/if}}

        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.campaign-results.table.column.results.label"}}
          </:header>
          <:cell>
            <MasteryPercentageDisplay
              @masteryRate={{participation.masteryRate}}
              @hasStages={{@campaign.hasStages}}
              @reachedStage={{participation.reachedStage}}
              @totalStage={{participation.totalStage}}
              @prescriberTitle={{participation.prescriberTitle}}
              @prescriberDescription={{participation.prescriberDescription}}
              @isTableDisplay={{true}}
            />
          </:cell>
        </PixTableColumn>

        {{#if @campaign.multipleSendings}}
          <PixTableColumn @context={{context}}>
            <:header>
              <EvolutionHeader @tooltipContent={{t "pages.campaign-results.table.evolution-tooltip.content"}} />
            </:header>
            <:cell>
              <ParticipationEvolutionIcon @evolution={{participation.evolution}} />
            </:cell>
          </PixTableColumn>

          <PixTableColumn @context={{context}} @type="number">
            <:header>
              <span aria-label={{t "pages.campaign-results.table.column.ariaSharedResultCount"}}>{{t
                  "pages.campaign-results.table.column.sharedResultCount"
                }}</span>
            </:header>
            <:cell>
              {{participation.sharedResultCount}}
            </:cell>
          </PixTableColumn>
        {{/if}}

        {{#if @campaign.hasBadges}}
          <PixTableColumn @context={{context}}>
            <:header>
              {{t "pages.campaign-results.table.column.badges"}}
            </:header>
            <:cell>
              <span class="participant-list__badges">
                <CampaignBadges @badges={{@campaign.badges}} @acquiredBadges={{participation.badges}} />
              </span>
            </:cell>
          </PixTableColumn>
        {{/if}}
      </:columns>
    </PixTable>

    {{#unless @participations}}
      <p class="table__empty content-text">{{t "pages.campaign-results.table.empty"}}</p>
    {{/unless}}

    {{#if @participations}}
      {{#let (getService "service:locale") as |locale|}}
        <PixPagination @pagination={{@participations.meta}} @locale={{locale.currentLanguage}} />
      {{/let}}
    {{/if}}
  </section>
</template>
