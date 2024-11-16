import { t } from 'ember-intl';

import TooltipWithIcon from '../../ui/tooltip-with-icon';

<template>
  <span class="evolution-header">

    {{t "pages.campaign-results.table.column.evolution"}}

    <TooltipWithIcon
      @iconName="help"
      @content={{@tooltipContent}}
      @ariaHiddenIcon={{true}}
      class="tooltip-with-icon-small"
    />
  </span>
</template>
