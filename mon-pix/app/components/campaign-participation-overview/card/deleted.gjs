import { PixTag } from '@1024pix/nebulix-ember';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';

function getStatusWording(state) {
  const statusKey = {
    started: 'started-at',
    aborted: 'started-at',
    completed: 'finished-at',
  };
  return `pages.campaign-participation-overview.card.${statusKey[state]}`;
}

<template>
  <article class="campaign-participation-overview-card" role="article">
    <div class="campaign-participation-overview-card__header">
      <PixTag class="campaign-participation-overview-card-header__tag" @color="grey-light">
        {{t "pages.campaign-participation-overview.card.tag.deleted"}}
      </PixTag>
      <p>
        <time class="campaign-participation-overview-card-header__date" datetime="{{@model.updatedAt}}">
          {{t (getStatusWording @model.state) date=(dayjsFormat @model.updatedAt "DD/MM/YYYY")}}
        </time>
      </p>
    </div>
    <section class="campaign-participation-overview-card-content">
      <div
        class="campaign-participation-overview-card-content__content campaign-participation-overview-card-content__archived-and-not-shared"
      >
        <p class="campaign-participation-overview-card-content--archived">
          {{t "pages.campaign-participation-overview.card.text-deleted" htmlSafe=true}}
        </p>
      </div>
    </section>
  </article>
</template>
