import { PixButton, PixModal } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class QuitResults extends Component {
  @service currentUser;
  @service router;
  @service session;

  @tracked showLeaveWithoutSignupModal = false;

  get isUserAnonymous() {
    return Boolean(this.currentUser.user?.isAnonymous);
  }

  @action
  toggleSignUpModal() {
    this.showLeaveWithoutSignupModal = !this.showLeaveWithoutSignupModal;
  }

  @action
  async goToSignup() {
    await this.session.invalidate();

    return this.router.transitionTo('authentication');
  }

  <template>
    {{#if this.isUserAnonymous}}
      <button class="evaluation-results-header__back-link" type="button" {{on "click" this.toggleSignUpModal}}>
        {{t "pages.skill-review.actions.back-to-pix"}}
      </button>
    {{else}}
      <LinkTo @route="authenticated" class="evaluation-results-header__back-link">
        {{t "pages.skill-review.actions.back-to-pix"}}
      </LinkTo>
    {{/if}}

    <PixModal
      @title={{t "pages.evaluation-results.quit-results.leave-without-signup-modal.title"}}
      @onCloseButtonClick={{this.toggleSignUpModal}}
      @showModal={{this.showLeaveWithoutSignupModal}}
    >
      <:content>
        <p class="quit-results__first-paragraph">{{t
            "pages.evaluation-results.quit-results.leave-without-signup-modal.content-information"
          }}</p>
        <p><strong>{{t
              "pages.evaluation-results.quit-results.leave-without-signup-modal.content-instruction"
            }}</strong></p>
      </:content>

      <:footer>
        <div class="quit-results__footer">
          <PixButton @variant="secondary" @triggerAction={{this.toggleSignUpModal}}>
            {{t "pages.evaluation-results.quit-results.leave-without-signup-modal.actions.cancel"}}
          </PixButton>

          <PixButton @triggerAction={{this.goToSignup}} @variant="primary">
            {{t "pages.evaluation-results.quit-results.leave-without-signup-modal.actions.leave"}}
          </PixButton>
        </div>
      </:footer>
    </PixModal>
  </template>
}
