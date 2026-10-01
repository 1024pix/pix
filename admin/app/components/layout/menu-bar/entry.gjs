import { PixIcon, PixTooltip } from '@1024pix/nebulix-ember';
import { LinkTo } from '@ember/routing';

<template>
  <li class="menu-bar__entry">
    <PixTooltip @position="right" ...attributes>
      <:triggerElement>
        <LinkTo @route={{@path}}>
          <PixIcon @name={{@icon}} @title={{@title}} @plainIcon={{true}} />
        </LinkTo>
      </:triggerElement>
      <:tooltip>{{@title}}</:tooltip>
    </PixTooltip>
  </li>
</template>
