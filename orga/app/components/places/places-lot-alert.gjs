import { PixNotificationAlert } from '@1024pix/nebulix-ember';
import dayjs from 'dayjs';
import { t } from 'ember-intl';
import { STATUSES } from 'pix-orga/models/organization-places-lot.js';

function getLastActivePlacesLot(placesLots) {
  return placesLots
    .filter((placesLot) => placesLot.status === STATUSES.ACTIVE)
    .sort((placesLotA, placesLotB) => placesLotB.expirationDate - placesLotA.expirationDate);
}

function getCountdDownDays(placesLots) {
  const [lastActiveLot] = getLastActivePlacesLot(placesLots);
  if (!lastActiveLot) return;
  return dayjs(lastActiveLot.expirationDate).diff(dayjs(), 'day');
}

function isAlertVisible(placesLots) {
  if (!Array.isArray(placesLots)) return false;

  const hasPendingLots = placesLots.some((placesLot) => placesLot.status === STATUSES.PENDING);

  if (hasPendingLots) return false;

  const [lastActiveLot] = getLastActivePlacesLot(placesLots);
  if (!lastActiveLot) return false;
  return dayjs(lastActiveLot.expirationDate).isBefore(dayjs().add(30, 'days'));
}

<template>
  {{#if (isAlertVisible @placesLots)}}
    <PixNotificationAlert @type="warning" @withIcon="true">
      {{t "banners.last-places-lot-available.message" days=(getCountdDownDays @placesLots)}}
    </PixNotificationAlert>
  {{/if}}
</template>
