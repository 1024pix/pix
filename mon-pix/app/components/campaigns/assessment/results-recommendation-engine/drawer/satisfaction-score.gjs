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
    <form>
      <fieldset class="results-recommendation-engine-drawer__form">
        <legend class="results-recommendation-engine-drawer__statement">
          {{t "pages.skill-review.recommended-engine.drawer.statement"}}
        </legend>
        <p class="results-recommendation-engine-drawer__instruction">
          {{t "pages.skill-review.recommended-engine.drawer.instruction"}}
        </p>
        <div class="results-recommendation-engine-drawer__emojis">
          {{#each EMOJIS as |satisfaction|}}
            <button
              type="button"
              class="results-recommendation-engine-drawer__emoji-button"
              aria-label={{t satisfaction.labelKey}}
              {{on "click" (fn this.selectScore satisfaction.score)}}
            >
              <span aria-hidden="true">{{satisfaction.emoji}}</span>
            </button>
          {{/each}}
        </div>
        <PixButton
          @variant="tertiary"
          @iconAfter="close"
          @triggerAction={{@onHide}}
          aria-label={{t "pages.skill-review.recommended-engine.drawer.hide-aria-label"}}
        >
          {{t "pages.skill-review.recommended-engine.drawer.hide"}}
        </PixButton>
      </fieldset>
    </form>
  </template>
}
