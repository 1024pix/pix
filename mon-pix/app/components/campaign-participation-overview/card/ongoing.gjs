import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import t from 'ember-intl/helpers/t';
import { eq } from 'ember-truth-helpers';

<template>
  <PixBlock class="campaign-participation-overview-card" role="article">
    <div class="campaign-participation-overview-card__header">
      <PixTag class="campaign-participation-overview-card-header__tag" @color="green-light">
        {{t "pages.campaign-participation-overview.card.tag.started"}}
      </PixTag>
      <h2 class="campaign-participation-overview-card-header__title">{{@model.organizationName}}</h2>
      <strong
        class="campaign-participation-overview-card-header__subtitle"
        title={{@model.campaignTitle}}
      >{{@model.campaignTitle}}</strong>
      <time class="campaign-participation-overview-card-header__date" datetime="{{@model.createdAt}}">
        {{t "pages.campaign-participation-overview.card.started-at" date=(dayjsFormat @model.createdAt "DD/MM/YYYY")}}
      </time>
    </div>
    <section class="campaign-participation-overview-card-content">
      <PixButtonLink
        class="campaign-participation-overview-card-content__action"
        @route={{if (eq @model.campaignType "COMBINED_COURSE") "combined-courses.programme" "campaigns.entry-point"}}
        @model={{@model.campaignCode}}
        @variant="success"
        aria-label={{t
          "pages.campaign-participation-overview.card.resume.extra-information"
          campaignTitle=@model.campaignTitle
        }}
      >
        {{t "pages.campaign-participation-overview.card.resume.information"}}
      </PixButtonLink>
    </section>
  </PixBlock>
</template>
