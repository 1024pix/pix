import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixProgressGauge from '@1024pix/pix-ui/components/pix-progress-gauge';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { modifier } from 'ember-modifier';

import MarkdownToHtml from '../../../../../../components/markdown-to-html';

export default class RewardsBadge extends Component {
  @tracked isDescriptionShrinked = true;

  @action
  toggleDescriptionShrink() {
    this.isDescriptionShrinked = !this.isDescriptionShrinked;
  }

  onDescriptionMount = modifier((element) => {
    this.handleShowMoreVisibility(element);
    window.addEventListener('resize', () => this.handleShowMoreVisibility(element));

    return () => {
      window.removeEventListener('resize', () => this.handleShowMoreVisibility(element));
    };
  });

  handleShowMoreVisibility = (element) => {
    const isTextFullyVisible = element.scrollWidth <= element.clientWidth;
    const hasShrinkedClass = element.classList.contains('evaluation-results-tab-badge__description--shrinked');
    const hasOneLinerClass = element.classList.contains('evaluation-results-tab-badge__description--one-liner');

    if (hasShrinkedClass && isTextFullyVisible) {
      element.classList.add('evaluation-results-tab-badge__description--one-liner');
    } else if (hasOneLinerClass) {
      element.classList.remove('evaluation-results-tab-badge__description--one-liner');
    }
  };

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
        <MarkdownToHtml
          @class="evaluation-results-tab-badge__description
            {{if this.isDescriptionShrinked 'evaluation-results-tab-badge__description--shrinked'}}"
          {{this.onDescriptionMount}}
          @markdown={{@badge.message}}
        />
        <PixButton
          class="evaluation-results-tab-badge__show-more"
          @triggerAction={{this.toggleDescriptionShrink}}
          @variant="tertiary"
          @size="small"
        >
          {{#if this.isDescriptionShrinked}}
            {{t "common.actions.show-more"}}
          {{else}}
            {{t "common.actions.show-less"}}
          {{/if}}
        </PixButton>
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
