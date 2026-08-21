import { PixButtonLink, PixTable, PixTableColumn } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import eq from 'ember-truth-helpers/helpers/eq';
import MissionBanner from 'pix-orga/components/banner/mission-banner';
import PageTitle from 'pix-orga/components/ui/page-title';

<template>
  {{pageTitle (t "pages.missions.title")}}

  <MissionBanner
    @isAdmin={{@model.isAdminOfTheCurrentOrganization}}
    @pixJuniorSchoolUrl={{@model.pixJuniorSchoolUrl}}
    @pixJuniorUrl={{@controller.juniorUrl}}
    @schoolCode={{@controller.schoolCode}}
  />

  <PageTitle>
    <:title>{{t "pages.missions.title"}}</:title>
  </PageTitle>

  {{#if @model.missions}}
    <PixTable
      @variant="orga"
      @data={{@model.missions}}
      @caption={{t "pages.missions.list.caption"}}
      @onRowClick={{@controller.goToMissionDetails}}
    >
      <:columns as |mission context|>
        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.missions.list.headers.name"}}</:header>
          <:cell>{{mission.name}}</:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.missions.list.headers.competences"}}</:header>
          <:cell>{{mission.competenceName}}</:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.missions.list.headers.started-by"}}</:header>
          <:cell>
            {{#if (eq mission.startedBy "")}}
              {{t "pages.missions.list.no-division"}}
            {{else}}
              {{mission.startedBy}}
            {{/if}}
          </:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.missions.list.headers.actions"}}</:header>
          <:cell>
            <PixButtonLink @route="authenticated.missions.mission" @model={{mission.id}} @variant="tertiary">
              {{t "pages.missions.list.actions.see-mission-details"}}
            </PixButtonLink>
          </:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>

  {{else}}
    <div class="table__empty content-text">
      {{t "pages.missions.list.empty-state"}}
    </div>
  {{/if}}
</template>
