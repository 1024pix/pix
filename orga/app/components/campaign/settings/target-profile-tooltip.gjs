import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { t } from 'ember-intl';

import TargetProfileDetails from '../target-profile-details';

<template>
  <PixTooltip @id="target-profile-info-tooltip" @position="top-right" @isWide={{true}}>
    <:triggerElement>
      <PixIcon
        ...attributes
        @name="help"
        @plainIcon={{true}}
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
        @simplifiedAccess={{@simplifiedAccess}}
      />
    </:tooltip>
  </PixTooltip>
</template>
