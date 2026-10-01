import { PixBlock, PixButtonLink, PixStars, PixTag } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import t from 'ember-intl/helpers/t';

export default class Disabled extends Component {
  <template>
    <PixBlock class="campaign-participation-overview-card" role="article">
      <div class="campaign-participation-overview-card__header">
        <PixTag class="campaign-participation-overview-card-header__tag" @color="grey-light">
          {{t "pages.campaign-participation-overview.card.tag.disabled"}}
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
        {{#if @model.isShared}}
          <div class="campaign-participation-overview-card-content__content">
            {{#if this.hasStages}}
              <PixStars
                @count={{this.count}}
                @total={{this.total}}
                @alt={{t "pages.campaign-participation-overview.card.stages" count=this.count total=this.total}}
                @color="yellow"
              />
            {{else}}
              <p>
                {{t "pages.campaign-participation-overview.card.results" result=@model.masteryRate}}
              </p>
            {{/if}}
          </div>
          <PixButtonLink
            class="campaign-participation-overview-card-content__action"
            @route="campaigns.entry-point"
            @model={{@model.campaignCode}}
            @variant="secondary"
          >
            {{t "pages.campaign-participation-overview.card.see-more"}}
          </PixButtonLink>
        {{else}}
          <div
            class="campaign-participation-overview-card-content__content campaign-participation-overview-card-content__archived-and-not-shared"
          >
            <p class="campaign-participation-overview-card-content--archived">
              {{t "pages.campaign-participation-overview.card.text-disabled" htmlSafe=true}}
            </p>
          </div>
        {{/if}}
      </section>
    </PixBlock>
  </template>
  get hasStages() {
    return this.args.model.totalStagesCount > 0;
  }

  get count() {
    return this.args.model.validatedStagesCount - 1;
  }

  get total() {
    return this.args.model.totalStagesCount - 1;
  }
}
