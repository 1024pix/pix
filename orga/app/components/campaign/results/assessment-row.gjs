import { array, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';

import MasteryPercentageDisplay from '../../ui/mastery-percentage-display';
import CampaignBadges from '../badges';

<template>
  <tr
    aria-label={{t "pages.campaign-results.table.row-title"}}
    {{on "click" (fn @onClickParticipant @campaignId @participation.id)}}
    class="tr--clickable"
  >
    <td>
      <LinkTo @route="authenticated.campaigns.participant-assessment" @models={{array @campaignId @participation.id}}>
        {{@participation.lastName}}
      </LinkTo>
    </td>
    <td>{{@participation.firstName}}</td>
    {{#if @hasExternalId}}
      <td class="table__column table__column--break-word">{{@participation.participantExternalId}}</td>
    {{/if}}
    <td>
      <MasteryPercentageDisplay
        @masteryRate={{@participation.masteryRate}}
        @hasStages={{@hasStages}}
        @reachedStage={{@participation.reachedStage}}
        @totalStage={{@participation.totalStage}}
        @prescriberTitle={{@participation.prescriberTitle}}
        @prescriberDescription={{@participation.prescriberDescription}}
        @isTableDisplay={{true}}
      />
    </td>
    {{#if @displayParticipationCount}}
      <td class="table__column--small">
        {{@participation.sharedResultCount}}
      </td>
    {{/if}}
    {{#if @hasBadges}}
      <td class="participant-list__badges">
        <CampaignBadges @badges={{@participation.badges}} />
      </td>
    {{/if}}
  </tr>
</template>
