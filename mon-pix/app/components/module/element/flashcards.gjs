import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import ModulixFlashcardsCard from 'mon-pix/components/module/element/flashcards-card';

export default class ModulixFlashcards extends Component {
  @tracked
  /**
   * Displayed side of the card on the screen
   * @type {'recto'|'verso'}
   */
  displayedSideName = 'recto';

  /**
   * Index of the displayed card in the deck
   * @type {number}
   */
  currentCardIndex = 0;

  get currentCard() {
    return this.args.flashcards.cards[this.currentCardIndex];
  }

  @action
  flipCard() {
    this.displayedSideName = this.displayedSideName === 'recto' ? 'verso' : 'recto';
  }

  <template>
    <div class="element-flashcards">
      <ModulixFlashcardsCard
        @card={{this.currentCard}}
        @displayedSideName={{this.displayedSideName}}
        @onCardFlip={{this.flipCard}}
      />

      <div class="element-flashcards__footer">
        {{#if (eq this.displayedSideName "recto")}}
          <p class="element-flashcards-footer__direction">{{t "pages.modulix.flashcards.direction"}}</p>
          <p class="element-flashcards-footer__position">{{t
              "pages.modulix.flashcards.position"
              currentCardPosition=1
              totalCards=1
            }}</p>
        {{/if}}
        {{#if (eq this.displayedSideName "verso")}}
          <button type="button">{{t "pages.modulix.buttons.flashcards.nextCard"}}</button>
        {{/if}}
      </div>
    </div>
  </template>
}
