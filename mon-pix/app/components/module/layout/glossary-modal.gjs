import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import InElement from 'mon-pix/components/in-element';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';

export default class GlossaryModal extends Component {
  @service intl;
  @service modulixGlossaryModal;

  get displayedEntries() {
    const { selectedWord } = this.modulixGlossaryModal;
    if (!selectedWord) return this.args.glossary;
    return this.args.glossary.filter(
      (entry) => entry.word.toLowerCase() === selectedWord.toLowerCase(),
    );
  }

  <template>
    <InElement @destinationId="modal-container" @waitForElement={{true}}>
      <PixModal
        @title={{t "pages.modulix.modals.book.title" count=this.displayedEntries.length}}
        @showModal={{this.modulixGlossaryModal.isBookModalOpen}}
        @onCloseButtonClick={{this.args.onCloseButtonClick}}
      >
        <:content>
          <dl class="module-navigation-glossary">
            {{#each this.displayedEntries as |entry|}}
              <dt>{{entry.word}}</dt>
              <dd>{{htmlUnsafe entry.definition}}</dd>
              <div class="module-navigation-glossary__divider"></div>
            {{/each}}
          </dl>
        </:content>
      </PixModal>
    </InElement>
  </template>
}
