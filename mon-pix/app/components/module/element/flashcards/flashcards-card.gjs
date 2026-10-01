import { PixButton } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';

import { resizeImage } from '../../../../utils/resize-image';

export default class ModulixFlashcardsCard extends Component {
  static MAX_HEIGHT = 170;

  get currentSide() {
    const side = this.args.displayedSideName;
    return this.args.card[side];
  }

  get dimensions() {
    return resizeImage(this.currentSide.image.information, { MAX_HEIGHT: ModulixFlashcardsCard.MAX_HEIGHT });
  }

  <template>
    <div class="element-flashcards-card">
      <div
        class="element-flashcards-card__content
          {{if this.currentSide.image 'element-flashcards-card__content--with-image'}}"
      >
        {{#if this.currentSide.image}}
          <div class="element-flashcards-card__image">
            <img
              src={{this.currentSide.image.url}}
              width={{this.dimensions.width}}
              height={{this.dimensions.height}}
              alt=""
            />
          </div>
        {{/if}}

        <div class="element-flashcards-card__text">
          {{#if (eq @displayedSideName "recto")}}
            <p class="element-flashcards-card__text--recto">{{this.currentSide.text}}</p>
          {{else if (eq @displayedSideName "verso")}}
            {{htmlUnsafe this.currentSide.text}}
          {{/if}}
        </div>
      </div>

      <div class="element-flashcards-card__footer element-flashcards-card__footer--{{@displayedSideName}}">
        {{#if (eq @displayedSideName "recto")}}
          <PixButton @triggerAction={{@onCardFlip}} @variant="primary" @size="small">
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
