import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { array, fn } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import { formatDate, t } from 'ember-intl';
import { gt } from 'ember-truth-helpers';
import Pagination from 'pix-orga/components/ui/pagination';

import CampaignParticipationFilters from '../filter/participation-filters';
import EvolutionHeader from './evolution-header';
import ParticipationEvolutionIcon from './participation-evolution-icon';

<template>
  <section>
    <h3 class="screen-reader-only">{{t "pages.profiles-list.table.title"}}</h3>

    <CampaignParticipationFilters
      @campaign={{@campaign}}
      @selectedDivisions={{@selectedDivisions}}
      @selectedGroups={{@selectedGroups}}
      @selectedCertificability={{@selectedCertificability}}
      @rowCount={{@profiles.meta.rowCount}}
      @searchFilter={{@searchFilter}}
      @participantExternalIdFilter={{@participantExternalIdFilter}}
      @participantExternalIdLabel={{@campaign.externalIdLabel}}
      @onFilter={{@onFilter}}
      @onResetFilter={{@onReset}}
      @isHiddenStatus={{true}}
    />

    <PixTable
      @variant="orga"
      @caption={{t "pages.profiles-list.table.caption"}}
      @data={{@profiles}}
      @onRowClick={{fn @onClickParticipant @campaign.id}}
      class="table"
    >
      <:columns as |participation context|>
        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.profiles-list.table.column.last-name"}}
          </:header>
          <:cell>
            <LinkTo
              @route="authenticated.campaigns.participant-profile"
              @models={{array @campaign.id participation.id}}
            >
              {{participation.lastName}}
            </LinkTo>
          </:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.profiles-list.table.column.first-name"}}
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
            {{t "pages.profiles-list.table.column.sending-date.label"}}
          </:header>
          <:cell>
            {{#if participation.sharedAt}}
              {{formatDate participation.sharedAt}}
            {{else}}
              <span class="table__column--highlight">{{t
                  "pages.profiles-list.table.column.sending-date.on-hold"
                }}</span>
            {{/if}}
          </:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.profiles-list.table.column.pix-score.label"}}
          </:header>
          <:cell>
            {{#if participation.sharedAt}}
              <PixTag @color="tertiary" class="pix-score-tag">
                {{t "pages.profiles-list.table.column.pix-score.value" score=participation.pixScore}}
              </PixTag>
            {{/if}}
          </:cell>
        </PixTableColumn>

        {{#if @campaign.multipleSendings}}
          <PixTableColumn @context={{context}}>
            <:header>
              <EvolutionHeader @tooltipContent={{t "pages.profiles-list.table.evolution-tooltip.content"}} />
            </:header>
            <:cell>
              <ParticipationEvolutionIcon @evolution={{participation.evolution}} />
            </:cell>
          </PixTableColumn>
        {{/if}}

        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.profiles-list.table.column.certifiable"}}
          </:header>
          <:cell>
            {{#if participation.certifiable}}
              <PixTag @color="green-light">{{t "pages.profiles-list.table.column.certifiable-tag"}}</PixTag>
            {{/if}}
          </:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}} @type="number">
          <:header>
            {{t "pages.profiles-list.table.column.competences-certifiables"}}
          </:header>
          <:cell>
            {{participation.certifiableCompetencesCount}}
          </:cell>
        </PixTableColumn>

        {{#if @campaign.multipleSendings}}
          <PixTableColumn @context={{context}} @type="number">
            <:header>
              <span aria-label={{t "pages.profiles-list.table.column.ariaSharedProfileCount"}}>
                {{t "pages.profiles-list.table.column.sharedProfileCount"}}
              </span>
            </:header>
            <:cell>
              {{participation.sharedProfileCount}}
            </:cell>
          </PixTableColumn>
        {{/if}}
      </:columns>
    </PixTable>

    {{#unless @profiles}}
      <p class="table__empty content-text">{{t "pages.profiles-list.table.empty"}}</p>
    {{/unless}}

    {{#if (gt @profiles.length 0)}}
      <Pagination @pagination={{@profiles.meta}} />
    {{/if}}
  </section>
</template>
