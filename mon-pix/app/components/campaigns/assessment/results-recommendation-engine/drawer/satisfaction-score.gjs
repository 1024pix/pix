import PixButton from '@1024pix/pix-ui/components/pix-button';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

const EMOJIS = [
  { score: 1, emoji: '😖', labelKey: 'pages.skill-review.recommended-engine.drawer.emojis.very-dissatisfied' },
  { score: 2, emoji: '😒', labelKey: 'pages.skill-review.recommended-engine.drawer.emojis.dissatisfied' },
  { score: 3, emoji: '😐', labelKey: 'pages.skill-review.recommended-engine.drawer.emojis.neutral' },
  { score: 4, emoji: '🙂', labelKey: 'pages.skill-review.recommended-engine.drawer.emojis.satisfied' },
  { score: 5, emoji: '😍', labelKey: 'pages.skill-review.recommended-engine.drawer.emojis.very-satisfied' },
];

export default class SatisfactionScore extends Component {
  @action
  selectScore(score) {
    this.args.onScoreSelected(score);
  }

  <template>
    <p class="results-recommendation-engine-drawer__statement">
      {{t "pages.skill-review.recommended-engine.drawer.statement"}}
    </p>
    <p class="results-recommendation-engine-drawer__instruction">
      {{t "pages.skill-review.recommended-engine.drawer.instruction"}}
    </p>
    <div
      class="results-recommendation-engine-drawer__emojis"
      role="group"
      aria-label={{t "pages.skill-review.recommended-engine.drawer.statement"}}
    >
      {{#each EMOJIS as |item|}}
        <button
          type="button"
          class="results-recommendation-engine-drawer__emoji-button"
          aria-label={{t item.labelKey}}
          {{on "click" (fn this.selectScore item.score)}}
        >
          <span aria-hidden="true">{{item.emoji}}</span>
        </button>
      {{/each}}
    </div>
    <PixButton @variant="tertiary" @iconAfter="close" @triggerAction={{@onHide}}>
      {{t "pages.skill-review.recommended-engine.drawer.hide"}}
    </PixButton>
  </template>
}
