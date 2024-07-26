import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { htmlUnsafe } from 'mon-pix/helpers/html-unsafe';

export default class ModulixImageElement extends Component {
  @tracked modalIsOpen = false;

  get hasAlternativeText() {
    return this.args.image.alternativeText.length > 0;
  }

  @action
  showModal() {
    this.modalIsOpen = true;
    this.args.openAlternativeText(this.args.image.id);
  }

  @action
  closeModal() {
    this.modalIsOpen = false;
  }

  <template>
    <div class="element-image">
      <div class="element-image__container">
        <img class="element-image-container__image" alt={{@image.alt}} src={{@image.url}} />
      </div>
      {{#if this.hasAlternativeText}}
        <PixButton @variant="tertiary" @triggerAction={{this.showModal}}>
          {{t "pages.modulix.buttons.element.alternativeText"}}
        </PixButton>
        <PixModal
          @title={{t "pages.modulix.modals.alternativeText.title"}}
          @showModal={{this.modalIsOpen}}
          @onCloseButtonClick={{this.closeModal}}
        >
          <:content>
            {{htmlUnsafe @image.alternativeText}}
          </:content>
        </PixModal>
      {{/if}}
    </div>
  </template>
}
