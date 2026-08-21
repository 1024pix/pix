import { PixTooltip } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';

const isAcquired = (badge, acquiredBadges = []) => {
  // if (hideBadgesAcquisition) {
  //   return true;
  // }

  let acquired = false;
  acquiredBadges.forEach((acquiredBadge) => {
    if (acquiredBadge.id === badge.id) {
      acquired = true;
    }
  });
  return acquired;
};

const getBadgeImageClass = (badge, acquiredBadges = [], hideBadgesAcquisition = false) => {
  if (hideBadgesAcquisition) return;
  if (!isAcquired(badge, acquiredBadges)) return 'badge--unacquired';
};

<template>
  {{#each @badges as |badge|}}
    <PixTooltip @id="badge-tooltip-{{badge.id}}">
      <:triggerElement>
        <img
          src={{badge.imageUrl}}
          alt={{badge.altMessage}}
          tabindex="0"
          class={{getBadgeImageClass badge @acquiredBadges @hideBadgesAcquisition}}
          aria-describedby="badge-tooltip-{{badge.id}}"
        />
      </:triggerElement>
      <:tooltip>
        {{badge.title}}
        {{#unless @hideBadgesAcquisition}}
          -
          {{if
            (isAcquired badge @acquiredBadges)
            (t "pages.campaign-results.table.badge-tooltip.acquired")
            (t "pages.campaign-results.table.badge-tooltip.unacquired")
          }}
        {{/unless}}
      </:tooltip>
    </PixTooltip>
  {{/each}}
</template>
