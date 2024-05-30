import { t } from 'ember-intl';
import { gt } from 'ember-truth-helpers';

<template>
  <div class="table__column--center">
    {{#if (gt @tutorials.length 0)}}
      {{t "pages.campaign-review.table.analysis.column.tutorial-count.value" count=@tutorials.length}}
    {{/if}}
  </div>
</template>
