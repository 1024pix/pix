import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { array, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';
import { gt } from 'ember-truth-helpers';

import TableHeader from '../../table/header';
import TablePaginationControl from '../../table/pagination-control';
import CampaignParticipationFilters from '../filter/participation-filters';

<template>
  <section ...attributes>
    <h3 class="screen-reader-only">{{t "pages.profiles-list.table.title"}}</h3>

    <CampaignParticipationFilters
      @campaign={{@campaign}}
      @selectedDivisions={{@selectedDivisions}}
      @selectedGroups={{@selectedGroups}}
      @selectedCertificability={{@selectedCertificability}}
      @rowCount={{@profiles.meta.rowCount}}
      @searchFilter={{@searchFilter}}
      @onFilter={{@onFilter}}
      @onResetFilter={{@onReset}}
      @isHiddenStatus={{true}}
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
          <col />
          <col class="hide-on-mobile" />
          <col class="hide-on-mobile" />
        </colgroup>
        <thead>
          <tr>
            <TableHeader>{{t "pages.profiles-list.table.column.last-name"}}</TableHeader>
            <TableHeader>{{t "pages.profiles-list.table.column.first-name"}}</TableHeader>
            {{#if @campaign.idPixLabel}}
              <TableHeader>{{@campaign.idPixLabel}}</TableHeader>
            {{/if}}
            <TableHeader @align="center">{{t "pages.profiles-list.table.column.sending-date.label"}}</TableHeader>
            <TableHeader @align="center">{{t "pages.profiles-list.table.column.pix-score.label"}}</TableHeader>
            <TableHeader @align="center" class="hide-on-mobile">{{t
                "pages.profiles-list.table.column.certifiable"
              }}</TableHeader>
            <TableHeader @align="center" class="hide-on-mobile">{{t
                "pages.profiles-list.table.column.competences-certifiables"
              }}</TableHeader>
          </tr>
        </thead>

        {{#if (gt @profiles.length 0)}}
          <tbody>
            {{#each @profiles as |profile|}}
              <tr
                aria-label={{t "pages.profiles-list.table.row-title"}}
                {{on "click" (fn @onClickParticipant @campaign.id profile.id)}}
                class="tr--clickable"
              >
                <td>
                  <LinkTo
                    @route="authenticated.campaigns.participant-profile"
                    @models={{array @campaign.id profile.id}}
                  >
                    {{profile.lastName}}
                  </LinkTo>
                </td>
                <td>{{profile.firstName}}</td>
                {{#if @campaign.idPixLabel}}
                  <td class="table__column table__column--break-word">{{profile.participantExternalId}}</td>
                {{/if}}
                <td class="table__column--center">
                  {{#if profile.sharedAt}}
                    {{dayjsFormat profile.sharedAt "DD/MM/YYYY"}}
                  {{else}}
                    <span class="table__column--highlight">{{t
                        "pages.profiles-list.table.column.sending-date.on-hold"
                      }}</span>
                  {{/if}}
                </td>
                <td class="table__column--center">
                  {{#if profile.sharedAt}}
                    <PixTag @color="tertiary" class="pix-score-tag">
                      {{t "pages.profiles-list.table.column.pix-score.value" score=profile.pixScore}}
                    </PixTag>
                  {{/if}}
                </td>
                <td class="table__column--center hide-on-mobile">
                  {{#if profile.certifiable}}
                    <PixTag @color="green-light">{{t "pages.profiles-list.table.column.certifiable"}}</PixTag>
                  {{/if}}
                </td>
                <td class="table__column--center hide-on-mobile">
                  {{profile.certifiableCompetencesCount}}
                </td>
              </tr>
            {{/each}}
          </tbody>
        {{/if}}
      </table>

      {{#unless @profiles}}
        <p class="table__empty content-text">{{t "pages.profiles-list.table.empty"}}</p>
      {{/unless}}
    </div>

    {{#if (gt @profiles.length 0)}}
      <TablePaginationControl @pagination={{@profiles.meta}} />
    {{/if}}
  </section>
</template>
