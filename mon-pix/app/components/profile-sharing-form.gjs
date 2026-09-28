import { PixButton, PixIcon } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class ProfileSharingForm extends Component {
  <template>
    <form {{on "submit" this.sendProfile}} class="send-profile-header__form">
      <p class="send-profile-header__recipient">
        {{t "pages.send-profile.form.recipient" recipient=@campaign.organizationName}}
      </p>

      {{#if @campaignParticipation.isShared}}
        <p class="skill-review-share__thanks">
          {{t "pages.send-profile.form.shared"}}
        </p>
        <LinkTo @route="authenticated" class="skill-review-share__back-to-home link">
          <PixIcon @name="arrowRight" @ariaHidden={{true}} />
          {{t "pages.send-profile.form.continue"}}
        </LinkTo>
      {{else if @errorMessage}}
        <p class="skill-review-share__thanks">{{@errorMessage}}</p>
        <LinkTo @route="authenticated" class="skill-review-share__back-to-home link">
          {{t "pages.send-profile.form.continue"}}
        </LinkTo>
      {{else}}
        <PixButton @type="submit">
          {{t "pages.send-profile.form.send"}}
        </PixButton>
      {{/if}}
    </form>
  </template>
  @action
  async sendProfile(event) {
    event.preventDefault();
    await this.args.sendProfile();
  }
}
