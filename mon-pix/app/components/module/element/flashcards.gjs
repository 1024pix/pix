import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class ModulixFlashcards extends Component {
  get currentCard() {
    return this.args.flashcards.cards[0];
  }

  <template>
    <img src={{this.currentCard.recto.image.url}} />
    {{this.currentCard.recto.text}}
    <button type="button">{{t "pages.modulix.buttons.flashcards.seeAnswer"}}</button>
    <p>{{t "pages.modulix.flashcards.direction"}}</p>
    <p>{{t "pages.modulix.flashcards.position" currentCardPosition=1 totalCards=1}}</p>
  </template>
}
