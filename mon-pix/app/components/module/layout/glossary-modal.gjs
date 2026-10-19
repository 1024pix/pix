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

  <template>
    <InElement @destinationId="modal-container" @waitForElement={{true}}>
      <PixModal
        @title={{t "pages.modulix.modals.book.title"}}
        @showModal={{this.modulixGlossaryModal.isBookModalOpen}}
        @onCloseButtonClick={{this.args.onCloseButtonClick}}
      >
        <:content>
          <dl class="module-navigation-glossary">
            {{#each @glossary as |entry|}}
              <dt>{{entry.word}}</dt>
              <dd>{{htmlUnsafe entry.definition}}</dd>
            {{/each}}
          </dl>
        </:content>
      </PixModal>
    </InElement>
  </template>
}
