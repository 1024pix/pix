import { PixTable, PixTableColumn, PixTag } from '@1024pix/nebulix-ember';
import { formatDate, t } from 'ember-intl';
import { eq, gt } from 'ember-truth-helpers';

import { STATUSES } from '../../models/organization-places-lot';
import EmptyState from '../ui/empty-state';

function emptyCell(value) {
  return value ? value : '-';
}

<template>
  {{#if (gt @placesLots.length 0)}}
    <h2 class="places-lots_title">{{t "pages.places.places-lots.table.title"}}</h2>

    <PixTable
      @variant="orga"
      @caption={{t "pages.places.places-lots.table.caption"}}
      @data={{@placesLots}}
      class="table"
      @onRowClick={{@onClickCampaign}}
    >
      <:columns as |placesLot context|>
        <PixTableColumn @context={{context}} @type="number">
          <:header>
            {{t "pages.places.places-lots.table.headers.count"}}
          </:header>
          <:cell>
            {{emptyCell placesLot.count}}
          </:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.places.places-lots.table.headers.activation-date"}}
          </:header>
          <:cell>
            {{formatDate placesLot.activationDate}}
          </:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.places.places-lots.table.headers.expiration-date"}}
          </:header>
          <:cell>
            {{emptyCell (formatDate placesLot.expirationDate)}}
          </:cell>
        </PixTableColumn>

        <PixTableColumn @context={{context}}>
          <:header>
            {{t "pages.places.places-lots.table.headers.status"}}
          </:header>
          <:cell>
            {{#if (eq placesLot.status STATUSES.PENDING)}}
              <PixTag @color="tertiary">{{t "pages.places.places-lots.statuses.pending"}}</PixTag>
            {{else if (eq placesLot.status STATUSES.ACTIVE)}}
              <PixTag @color="success">{{t "pages.places.places-lots.statuses.active"}}</PixTag>
            {{else}}
              <PixTag @color="neutral">{{t "pages.places.places-lots.statuses.expired"}}</PixTag>
            {{/if}}
          </:cell>
        </PixTableColumn>
      </:columns>
    </PixTable>

  {{else}}
    <div class="places-lots_empty-state">
      <EmptyState @infoText={{t "pages.places.places-lots.table.empty-state"}} />
    </div>
  {{/if}}
</template>
