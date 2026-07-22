import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixRadioButton from '@1024pix/pix-ui/components/pix-radio-button';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { concat, fn, get } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import eq from 'ember-truth-helpers/helpers/eq';
import modifierDidInsert from 'mon-pix/modifiers/modifier-did-insert';

const SCORES = [1, 2, 3, 4, 5];

const SCALES = [
  {
    key: 'usefulness',
  },
  {
    key: 'personalization',
  },
  {
    key: 'attractiveness',
  },
];

const TRANSLATION_PREFIX = 'pages.skill-review.recommended-engine.drawer.content-relevance-form';

export default class ContentRelevanceForm extends Component {
  @tracked usefulness = null;
  @tracked personalization = null;
  @tracked attractiveness = null;
  @tracked comment = null;

  get isSubmitDisabled() {
    return !SCALES.every((scale) => this[scale.key] !== null);
  }

  @action
  selectScore(scaleKey, score) {
    this[scaleKey] = score;
  }

  @action
  submit() {
    this.args.onSubmit({
      scores: {
        usefulness: this.usefulness,
        personalization: this.personalization,
        attractiveness: this.attractiveness,
      },
      comment: this.comment,
    });
  }

  @action
  focusOnInsert(element) {
    element.focus();
  }

  @action
  updateComment(event) {
    this.comment = event.target.value;
  }

  <template>
    <div
      role="status"
      class="results-recommendation-engine-drawer__content-relevance-form"
      tabindex="-1"
      {{modifierDidInsert this.focusOnInsert}}
    >
      <p class="results-recommendation-engine-drawer__content-relevance-form-title">
        {{t "pages.skill-review.recommended-engine.drawer.content-relevance-form.title"}}
      </p>
      <p class="results-recommendation-engine-drawer__content-relevance-form-subtitle">
        {{t "pages.skill-review.recommended-engine.drawer.content-relevance-form.subtitle"}}
      </p>
      <form>
        <fieldset class="results-recommendation-engine-drawer__content-relevance-form-fieldset">
          <legend class="results-recommendation-engine-drawer__content-relevance-form-legend">
            <p class="results-recommendation-engine-drawer__content-relevance-form-legend__title">{{t
                "pages.skill-review.recommended-engine.drawer.content-relevance-form.legend"
              }}</p>
            <p class="results-recommendation-engine-drawer__content-relevance-form-legend__instruction">
              {{t "pages.skill-review.recommended-engine.drawer.content-relevance-form.instruction"}}
            </p>
          </legend>
          {{#each SCALES as |scale|}}
            <fieldset class="results-recommendation-engine-drawer__scale">
              <legend class="screen-reader-only">{{t (concat TRANSLATION_PREFIX "." scale.key ".legend")}}</legend>
              <span class="results-recommendation-engine-drawer__scale-label" aria-hidden="true">
                {{t (concat TRANSLATION_PREFIX "." scale.key ".min-label")}}
              </span>
              <div class="results-recommendation-engine-drawer__scale-radios">
                {{#each SCORES as |score|}}
                  <PixRadioButton
                    name={{scale.key}}
                    @value={{score}}
                    @screenReaderOnly={{true}}
                    checked={{eq (get this scale.key) score}}
                    {{on "click" (fn this.selectScore scale.key score)}}
                    aria-required="true"
                  >
                    <:label>
                      {{t
                        "pages.skill-review.recommended-engine.drawer.content-relevance-form.score-aria-label"
                        score=score
                      }}
                    </:label>
                  </PixRadioButton>
                {{/each}}
              </div>
              <span class="results-recommendation-engine-drawer__scale-label" aria-hidden="true">
                {{t (concat TRANSLATION_PREFIX "." scale.key ".max-label")}}
              </span>
            </fieldset>
          {{/each}}
          <PixTextarea
            @id="comment-content-relevance"
            @maxlength="250"
            placeholder={{t
              "pages.skill-review.recommended-engine.drawer.content-relevance-form.comment-text.placeholder"
            }}
            @screenReaderOnly="true"
            class="results-recommendation-engine-drawer__content-relevance-form-comment-text"
            rows="5"
            cols="50"
            {{on "change" this.updateComment}}
          >
            <:label>{{t
                "pages.skill-review.recommended-engine.drawer.content-relevance-form.comment-text.label"
              }}</:label>
          </PixTextarea>
          <div class="results-recommendation-engine-drawer__content-relevance-form-actions">
            <PixButton
              @variant="tertiary"
              @triggerAction={{@onHide}}
              aria-label={{t "pages.skill-review.recommended-engine.drawer.hide-aria-label"}}
            >
              {{t "pages.skill-review.recommended-engine.drawer.hide"}}
            </PixButton>
            <PixButton @variant="primary" @isDisabled={{this.isSubmitDisabled}} @triggerAction={{this.submit}}>
              {{t "common.actions.send"}}
            </PixButton>
          </div>
        </fieldset>
      </form>
    </div>
  </template>
}
