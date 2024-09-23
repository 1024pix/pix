import PixProgressGauge from '@1024pix/pix-ui/components/pix-progress-gauge';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import MarkdownToHtml from '../../../../../../components/markdown-to-html';
import ShowMoreText from '../../../../../../components/show-more-text';

export default class RewardsBadge extends Component {
  @tracked isDescriptionShrinked = true;

  @action
  toggleDescriptionShrink() {
    this.isDescriptionShrinked = !this.isDescriptionShrinked;
  }

  <template>
    <li
      class={{if
        @badge.isAcquired
        "evaluation-results-tab__badge"
        "evaluation-results-tab__badge evaluation-results-tab__badge--not-acquired"
      }}
      title={{t
        (if
          @badge.isAcquired
          "pages.skill-review.badge-card.acquired-full"
          "pages.skill-review.badge-card.not-acquired-full"
        )
      }}
    >
      <div class="evaluation-results-tab-badge__image-container">
        <img class="evaluation-results-tab-badge__image" src={{@badge.imageUrl}} alt="" />
      </div>
      <div class="evaluation-results-tab-badge__content">
        <h3 class="evaluation-results-tab-badge__title">
          {{@badge.title}}
        </h3>
        {{#if @badge.isCertifiable}}
          <PixTag class="evaluation-results-tab-badge__certifiable" @color={{if @badge.isAcquired "success" "neutral"}}>
            {{t "pages.skill-review.badge-card.certifiable"}}
          </PixTag>
        {{/if}}
        <ShowMoreText class="evaluation-results-tab-badge__description">
          <MarkdownToHtml @markdown={{@badge.message}} @isInline={{true}} />
        </ShowMoreText>
        {{#unless @badge.isAcquired}}
          <PixProgressGauge
            class="evaluation-results-tab-badge__progress-gauge"
            @value={{@badge.acquisitionPercentage}}
          />
        {{/unless}}
      </div>
    </li>
  </template>
}
