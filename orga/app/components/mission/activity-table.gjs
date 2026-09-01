import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { t } from 'ember-intl';
import Pagination from 'pix-orga/components/ui/pagination';

function statusColor(status) {
  return {
    'not-started': 'tertiary',
    completed: 'success',
    started: 'secondary',
  }[status];
}

<template>
  {{#if @missionLearners}}
    <PixTable
      @variant="orga"
      class="table"
      @data={{@missionLearners}}
      @caption={{t "pages.missions.mission.table.activities.caption" missionName=@mission.name}}
    >
      <:columns as |missionLearner context|>
        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.missions.mission.table.activities.headers.first-name"}}</:header>
          <:cell>{{missionLearner.firstName}}</:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.missions.mission.table.activities.headers.last-name"}}</:header>
          <:cell>{{missionLearner.lastName}}</:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.missions.mission.table.activities.headers.division"}}</:header>
          <:cell>
            {{missionLearner.division}}
          </:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>{{t "pages.missions.mission.table.activities.headers.status"}}</:header>
          <:cell>
            <PixTag @color={{statusColor missionLearner.missionStatus}}>{{t missionLearner.displayableStatus}}</PixTag>
          </:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>

    <Pagination @pagination={{@missionLearners.meta}} />

  {{else}}
    <div class="table__empty content-text">
      {{t "pages.missions.mission.table.activities.no-data"}}
    </div>
  {{/if}}
</template>
