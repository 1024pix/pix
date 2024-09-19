import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';

export default class ModulixFlashcards extends Component {
  @tracked
  /**
   * Displayed side of the card on the screen
   * @type {'recto'|'verso'}
   */
  displayedSide = 'recto';

  /**
   * Index of the displayed card in the deck
   * @type {number}
   */
  currentCardIndex = 0;

  get currentCardSide() {
    const side = this.displayedSide;
    return this.args.flashcards.cards[this.currentCardIndex][side];
  }

  @action
  flipCard() {
    this.displayedSide = this.displayedSide === 'recto' ? 'verso' : 'recto';
  }

  <template>
    <div class="element-flashcards">
      <div class="element-flashcards__card">
        {{#if this.currentCardSide.image}}
          <div class="element-flashcards-card__image">
            <img src={{this.currentCardSide.image.url}} alt="" />
          </div>
        {{/if}}

        <div class="element-flashcards-card__text">
          {{#if (eq this.displayedSide "recto")}}
            <p class="element-flashcards-card__text--recto">{{this.currentCardSide.text}}</p>
          {{else if (eq this.displayedSide "verso")}}
            {{htmlUnsafe this.currentCardSide.text}}
          {{/if}}
        </div>

        <div class="element-flashcards-card__footer element-flashcards-card__footer--{{this.displayedSide}}">
          {{#if (eq this.displayedSide "recto")}}
            <PixButton
              @triggerAction={{this.flipCard}}
              @variant="primary"
              @size="small"
              @iconAfter="rotate-right"
            >
              {{t "pages.modulix.buttons.flashcards.seeAnswer"}}
            </PixButton>
          {{/if}}
          {{#if (eq this.displayedSide "verso")}}
            <PixButton @triggerAction={{this.flipCard}} @variant="tertiary" @size="small">
              {{t "pages.modulix.buttons.flashcards.seeAgain"}}
            </PixButton>
          {{/if}}
        </div>
      </div>

    {{#if (eq this.displayedSide "recto")}}
      <p>{{t "pages.modulix.flashcards.direction"}}</p>
      <p>{{t "pages.modulix.flashcards.position" currentCardPosition=1 totalCards=1}}</p>
    {{/if}}
    {{#if (eq this.displayedSide "verso")}}
      <button type="button">{{t "pages.modulix.buttons.flashcards.nextCard"}}</button>
    {{/if}}
  </template>
}
