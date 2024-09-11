import PixTag from '@1024pix/pix-ui/components/pix-tag';
import dayjs from 'dayjs';
import { t } from 'ember-intl';
import { eq, gt } from 'ember-truth-helpers';

import { STATUSES } from '../../models/organization-places-lot';
import Header from '../table/header';
import EmptyState from '../ui/empty-state.js';

function displayDate(date) {
  return dayjs(date).format('DD/MM/YYYY');
}

function emptyCell(value) {
  return value ? value : '-';
}

<template>
  {{#if (gt @placesLots.length 0)}}
    <h2 class="places-lots_title">{{t "pages.places.places-lots.table.title"}}</h2>
    <div class="panel">
      <table class="table">
        <caption class="screen-reader-only">{{t "pages.places.places-lots.table.caption"}}</caption>
        <thead>
          <tr>
            <Header @size="medium" scope="col">{{t "pages.places.places-lots.table.headers.count"}}</Header>
            <Header scope="col">{{t "pages.places.places-lots.table.headers.activation-date"}}</Header>
            <Header scope="col">{{t "pages.places.places-lots.table.headers.expiration-date"}}</Header>
            <Header scope="col">{{t "pages.places.places-lots.table.headers.status"}}</Header>
          </tr>
        </thead>
        <tbody>
          {{#each @placesLots as |placesLot|}}
            <tr>
              <td>{{emptyCell placesLot.count}}</td>
              <td>{{displayDate placesLot.activationDate}}</td>
              <td>{{emptyCell (displayDate placesLot.expirationDate)}}</td>
              <td>
                {{#if (eq placesLot.status STATUSES.PENDING)}}
                  <PixTag @color="tertiary">{{t "pages.places.places-lots.statuses.pending"}}</PixTag>
                {{else if (eq placesLot.status STATUSES.ACTIVE)}}
                  <PixTag @color="success">{{t "pages.places.places-lots.statuses.active"}}</PixTag>
                {{else}}
                  <PixTag @color="neutral">{{t "pages.places.places-lots.statuses.expired"}}</PixTag>
                {{/if}}
              </td>
            </tr>
          {{/each}}
        </tbody>
      </table>
    </div>
  {{else}}
    <div class="places-lots_empty-state">
      <EmptyState @infoText={{t "pages.places.places-lots.table.empty-state"}} />
    </div>
  {{/if}}
</template>
