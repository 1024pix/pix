import PixButton from '@1024pix/pix-ui/components/pix-button';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';

export default class ModulixFlashcardsCard extends Component {
  get currentSide() {
    const side = this.args.displayedSideName;
    return this.args.card[side];
  }

  <template>
    <div class="element-flashcards__card">
      {{#if this.currentSide.image}}
        <div class="element-flashcards-card__image">
          <img src={{this.currentSide.image.url}} alt="" />
        </div>
      {{/if}}

      <div class="element-flashcards-card__text">
        {{#if (eq @displayedSideName "recto")}}
          <p class="element-flashcards-card__text--recto">{{this.currentSide.text}}</p>
        {{else if (eq @displayedSideName "verso")}}
          {{htmlUnsafe this.currentSide.text}}
        {{/if}}
      </div>

      <div class="element-flashcards-card__footer element-flashcards-card__footer--{{@displayedSideName}}">
        {{#if (eq @displayedSideName "recto")}}
          <PixButton @triggerAction={{@onCardFlip}} @variant="primary" @size="small" @iconAfter="rotate-right">
            {{t "pages.modulix.buttons.flashcards.seeAnswer"}}
          </PixButton>
        {{/if}}
        {{#if (eq @displayedSideName "verso")}}
          <PixButton @triggerAction={{@onCardFlip}} @variant="tertiary" @size="small">
            {{t "pages.modulix.buttons.flashcards.seeAgain"}}
          </PixButton>
        {{/if}}
      </div>
    </div>
  </template>
}
