import { t } from 'ember-intl';

import { htmlUnsafe } from '../../helpers/html-unsafe';

const joinWords = (words) => words.join(', ');

<template>
  {{#if @glossary.length}}
    <section class="module-preview-glossary" aria-labelledby="module-preview-glossary-title">
      <h2 id="module-preview-glossary-title" class="module-preview-glossary__title">
        {{t "pages.modulix.preview.glossary.title"}}
      </h2>
      <dl class="module-preview-glossary__list">
        {{#each @glossary as |entry|}}
          <dt class="module-preview-glossary__words">{{joinWords entry.words}}</dt>
          <dd class="module-preview-glossary__definition">{{htmlUnsafe entry.definition}}</dd>
        {{/each}}
      </dl>
    </section>
  {{/if}}
</template>
