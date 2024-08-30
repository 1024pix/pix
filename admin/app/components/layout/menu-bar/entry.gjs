import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { LinkTo } from '@ember/routing';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';

<template>
  <li class="menu-bar__entry">
    <PixTooltip @position="right" ...attributes>
      <:triggerElement>
        <LinkTo @route={{@path}}>
          <FaIcon @icon={{@icon}} @title={{@title}} />
        </LinkTo>
      </:triggerElement>
      <:tooltip>{{@title}}</:tooltip>
    </PixTooltip>
  </li>
</template>
