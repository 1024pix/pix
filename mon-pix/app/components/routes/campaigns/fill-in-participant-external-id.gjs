import PixBackgroundHeader from '@1024pix/pix-ui/components/pix-background-header';
import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

const ERROR_MESSAGE = {
  INVALID_EMAIL: 'pages.fill-in-participant-external-id.errors.invalid-external-id-email',
  INVALID_EXTERNAL_ID: 'pages.fill-in-participant-external-id.errors.invalid-external-id',
  MISSING_EXTERNAL_ID: 'pages.fill-in-participant-external-id.errors.missing-external-id',
};
export default class FillInParticipantExternalId extends Component {
  @service intl;
  @service campaignStorage;

  @tracked participantExternalId = this.previousParticipantExternalId || null;
  @tracked isLoading = false;
  @tracked errorMessage = ERROR_MESSAGE[this.previousError] ? this.intl.t(ERROR_MESSAGE[this.previousError]) : null;

  get previousError() {
    return this.campaignStorage.get(this.args.campaign.code, 'error');
  }
  get previousParticipantExternalId() {
    return this.campaignStorage.get(this.args.campaign.code, 'previousParticipantExternalId');
  }

  @action
  submit(event) {
    event.preventDefault();

    if (!this.participantExternalId.trim()) {
      this.errorMessage = this.intl.t('pages.fill-in-participant-external-id.errors.missing-external-id', {
        externalIdLabel: this.args.campaign.externalIdLabel,
      });
      return;
    }

    if (this.participantExternalId.length > 255) {
      this.errorMessage = this.intl.t('pages.fill-in-participant-external-id.errors.max-length-external-id', {
        externalIdLabel: this.args.campaign.externalIdLabel,
      });
      return;
    }

    this.errorMessage = null;
    return this.args.onSubmit(this.participantExternalId);
  }

  @action
  updateParticipantExternalId(event) {
    this.participantExternalId = event.target.value;
  }

  @action
  resetErrorMessage() {
    if (!this.errorMessage) return;

    this.errorMessage = null;
  }

  @action
  cancel() {
    this.errorMessage = null;
    return this.args.onCancel();
  }

  get idPixInputType() {
    if (this.args.campaign.externaIdType === 'EMAIL') {
      return 'email';
    } else if (this.args.campaign.externaIdType === 'STRING') {
      return 'text';
    }
    return null;
  }

  get idPixInputSubLabel() {
    if (this.args.campaign.externaIdType === 'EMAIL') {
      return this.intl.t('pages.signup.fields.email.help');
    } else if (this.args.campaign.externaIdType === 'STRING') {
      return '';
    }
    return null;
  }

  <template>
    <main role="main">
      <PixBackgroundHeader>
        <PixBlock class="fill-in-participant-external-id">
          <h1 class="fill-in-participant-external-id__title">{{t "pages.fill-in-participant-external-id.first-title"}}
          </h1>
          <p class="fill-in-participant-external-id__announcement">
            {{t "pages.fill-in-participant-external-id.announcement"}}
          </p>

          <form {{on "submit" this.submit}} class="fill-in-participant-external-id__form">
            <PixInput
              @id="external-id"
              @value={{this.participantExternalId}}
              @errorMessage={{this.errorMessage}}
              @validationStatus={{if this.errorMessage "error"}}
              @requiredLabel={{true}}
              {{on "input" this.resetErrorMessage}}
              {{on "change" this.updateParticipantExternalId}}
              @subLabel={{this.idPixInputSubLabel}}
              type={{this.idPixInputType}}
              aria-autocomplete="none"
            >
              <:label>{{@campaign.externalIdLabel}}</:label>
            </PixInput>

            {{#if @campaign.externalIdHelpImageUrl}}
              <img
                class="fill-in-participant-external-id__help"
                src={{@campaign.externalIdHelpImageUrl}}
                alt={{@campaign.alternativeTextToExternalIdHelpImage}}
              />
            {{/if}}

            <div class="fill-in-participant-external-id__buttonbar">
              <PixButton @variant="secondary" @triggerAction={{this.cancel}}>
                {{t "pages.fill-in-participant-external-id.buttons.cancel"}}
              </PixButton>

              <PixButton @type="submit">
                {{t "pages.fill-in-participant-external-id.buttons.continue"}}
              </PixButton>
            </div>
          </form>
        </PixBlock>
      </PixBackgroundHeader>
    </main>
  </template>
}
