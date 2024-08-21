import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';

<template>
  <th class="attach-badges-header">
    <span class="attach-badges-header__content">
      {{yield}}
      {{#unless @isOptionnal}}
        <abbr title="obligatoire" class="mandatory-mark">*</abbr>
      {{/unless}}
      {{#if (has-block "tooltip")}}
        <PixTooltip role="tooltip" @isLight={{true}} @isWide={{true}} @position="bottom-left" class="content_tooltip">
          <:triggerElement><FaIcon @icon="circle-info" /></:triggerElement>
          <:tooltip>{{yield to="tooltip"}}</:tooltip>
        </PixTooltip>
      {{/if}}
    </span>
  </th>
</template>
