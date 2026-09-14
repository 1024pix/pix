import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { on } from '@ember/modifier';
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

const getBadgeImageClass = (badge, acquiredBadges = [], hideBadgesAcquisition = false) => {
  if (hideBadgesAcquisition) return;
  if (!isAcquired(badge, acquiredBadges)) return 'badge--unacquired';
};

function setDefaultBadge(event) {
  event.target.setAttribute('src', '/images/badge_no_url.svg');
}

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
          {{on "error" setDefaultBadge}}
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
