import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { t } from 'ember-intl';

import TargetProfileDetails from '../target-profile-details';

<template>
  <PixTooltip @id="target-profile-info-tooltip" @position="top-right" @isWide={{true}}>
    <:triggerElement>
      <FaIcon
        ...attributes
        @icon="circle-info"
        tabindex="0"
        aria-label={{t "pages.campaign-settings.target-profile.tooltip"}}
        aria-describedby="target-profile-info-tooltip"
      />
    </:triggerElement>
    <:tooltip>
      <TargetProfileDetails
        @targetProfileDescription={{@targetProfileDescription}}
        @hasStages={{@hasStages}}
        @hasBadges={{@hasBadges}}
        @targetProfileTubesCount={{@targetProfileTubesCount}}
        @targetProfileThematicResultCount={{@targetProfileThematicResultCount}}
      />
    </:tooltip>
  </PixTooltip>
</template>
