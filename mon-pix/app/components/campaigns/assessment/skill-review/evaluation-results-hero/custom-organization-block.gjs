import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { t } from 'ember-intl';
import { and } from 'ember-truth-helpers';

import MarkdownToHtml from '../../../../markdown-to-html';

<template>
  <div class="evaluation-results-hero__organization-block">
    <h3 class="evaluation-results-hero-organization-block__title">
      {{t "pages.skill-review.organization-message"}}
    </h3>
    {{#if @customResultPageText}}
      <MarkdownToHtml
        class="evaluation-results-hero-organization-block__message"
        @isInline={{true}}
        @markdown={{@customResultPageText}}
      />
    {{/if}}
    {{#if (and @customResultPageButtonUrl @customResultPageButtonText)}}
      <PixButtonLink
        class="evaluation-results-hero-organization-block__link"
        @href={{@customResultPageButtonUrl}}
        @variant="secondary"
      >
        {{@customResultPageButtonText}}
      </PixButtonLink>
    {{/if}}
  </div>
</template>
