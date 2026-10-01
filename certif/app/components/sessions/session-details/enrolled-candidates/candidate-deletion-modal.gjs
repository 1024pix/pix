import { PixButton, PixModal } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import { dayjsUtcFormat } from '../../../../helpers/dayjs-utc-format';

const TRANSLATE_PREFIX = 'pages.sessions.detail.candidates';

export default class CandidateCreationModal extends Component {
  @service intl;
  @service pixToast;
  @service router;

  @tracked isLoading = false;

  @action
  async deleteCertificationCandidate() {
    const sessionId = Number(this.router.currentRoute.parent.params.session_id);

    this.isLoading = true;

    try {
      await this.args.candidate.destroyRecord({ adapterOptions: { sessionId } });
      this.pixToast.sendSuccessNotification({
        message: this.intl.t(`${TRANSLATE_PREFIX}.deletion-modal.notifications.success-remove`),
      });
    } catch (error) {
      let errorText = this.intl.t(`${TRANSLATE_PREFIX}.deletion-modal.notifications.error-remove-unknown`);
      if (error?.errors?.[0]?.code === 403) {
        errorText = this.intl.t(`${TRANSLATE_PREFIX}.deletion-modal.notifications.error-remove-already-in`);
      }
      this.pixToast.sendErrorNotification({ message: errorText });
    } finally {
      this.isLoading = false;
      this.args.toggleModal();
    }
  }

  get candidateFormattedBirthdate() {
    if (!this.args.candidate) return '';
    return dayjsUtcFormat([this.args.candidate.birthdate, 'DD/MM/YYYY'], {});
  }

  <template>
    <PixModal
      class='delete-candidate-modal'
      @title={{t 'pages.sessions.detail.candidates.deletion-modal.title'}}
      @showModal={{@showModal}}
      @onCloseButtonClick={{@toggleModal}}
      @iconName='warning'
    >
      <:content>
        <p>
          {{t
            'pages.sessions.detail.candidates.deletion-modal.body'
            firstName=@candidate.firstName
            lastName=@candidate.lastName
            birthdate=this.candidateFormattedBirthdate
            htmlSafe=true
          }}
        </p>
      </:content>
      <:footer>
        <PixButton
          aria-label={{t 'pages.sessions.detail.candidates.deletion-modal.actions.close-extra-information'}}
          @triggerAction={{@toggleModal}}
          @variant='secondary'
          @isBorderVisible='true'
        >
          {{t 'common.actions.close'}}
        </PixButton>
        <PixButton
          @triggerAction={{this.deleteCertificationCandidate}}
          @isLoading={{this.isLoading}}
          @isDisabled={{this.isLoading}}
        >
          {{t 'pages.sessions.detail.candidates.deletion-modal.actions.submit'}}
        </PixButton>
      </:footer>
    </PixModal>
  </template>
}
