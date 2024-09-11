import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class QuitResults extends Component {
  @tracked showModal = false;

  @action
  toggleModal() {
    this.showModal = !this.showModal;
  }

  <template>
    {{#if @isCampaignShared}}
      <LinkTo @route="authenticated" class="evaluation-results-header__back-link">
        {{t "common.actions.quit"}}
      </LinkTo>
    {{else}}
      <button class="evaluation-results-header__back-link" type="button" {{on "click" this.toggleModal}}>
        {{t "common.actions.quit"}}
      </button>
    {{/if}}

    <PixModal
      @title={{t "pages.evaluation-results.quit-results.modal.title"}}
      @onCloseButtonClick={{this.toggleModal}}
      @showModal={{this.showModal}}
    >
      <:content>
        <p class="quit-results__first-paragraph">{{t
            "pages.evaluation-results.quit-results.modal.content-information"
          }}</p>
        <p><strong>{{t "pages.evaluation-results.quit-results.modal.content-instruction"}}</strong></p>
      </:content>

      <:footer>
        <div class="quit-results__footer">
          <PixButton @variant="secondary" @triggerAction={{this.toggleModal}}>
            {{t "pages.evaluation-results.quit-results.modal.actions.cancel-to-share"}}
          </PixButton>

          <PixButtonLink @href="authenticated" @variant="primary">
            {{t "pages.evaluation-results.quit-results.modal.actions.quit-without-sharing"}}
          </PixButtonLink>
        </div>
      </:footer>
    </PixModal>
  </template>
}
