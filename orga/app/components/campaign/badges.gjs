import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { t } from 'ember-intl';

const isAcquired = (badge, acquiredBadges = []) => {
  let acquired = false;
  acquiredBadges.forEach((acquiredBadge) => {
    if (acquiredBadge.id === badge.id) {
      acquired = true;
    }
  });
  return acquired;
};

<template>
  {{#each @badges as |badge|}}
    <PixTooltip @id="badge-tooltip-{{badge.id}}" @position="bottom">
      <:triggerElement>
        <img
          src={{badge.imageUrl}}
          alt={{badge.altMessage}}
          tabindex="0"
          class={{unless (isAcquired badge @acquiredBadges) "badge--unacquired"}}
          aria-describedby="badge-tooltip-{{badge.id}}"
        />
      </:triggerElement>
      <:tooltip>
        {{badge.title}}
        -
        {{if
          (isAcquired badge @acquiredBadges)
          (t "pages.campaign-results.table.badge-tooltip.acquired")
          (t "pages.campaign-results.table.badge-tooltip.unacquired")
        }}
      </:tooltip>
    </PixTooltip>
  {{/each}}
</template>
