import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import ConfirmPopup from '../../../confirm-popup';

export default class CertificationInformationGlobalActions extends Component {
  @service pixToast;
  @service store;
  @service intl;

  @tracked confirmAction = this.onCancelCertificationConfirmation;
  @tracked confirmErrorMessage = '';
  @tracked confirmMessage = '';
  @tracked displayConfirm = false;
  @tracked modalTitle = null;

  get basicActionsRequirements() {
    return this.args.session.finalizedAt && !this.args.certification.isPublished;
  }

  get displayCancelCertificationButton() {
    return (
      this.basicActionsRequirements &&
      !this.args.certification.isCertificationCancelled &&
      !this.isCertificationRejected
    );
  }

  get displayUncancelCertificationButton() {
    return (
      this.basicActionsRequirements && this.args.certification.isCertificationCancelled && !this.isCertificationRejected
    );
  }

  get displayRejectCertificationButton() {
    return (
      this.basicActionsRequirements &&
      !this.isCertificationRejected &&
      !this.args.certification.isCertificationCancelled
    );
  }

  get displayUnrejectCertificationButton() {
    return (
      this.basicActionsRequirements && this.isCertificationRejected && !this.args.certification.isCertificationCancelled
    );
  }

  get isCertificationRejected() {
    return this.args.certification.status === 'rejected' && this.args.certification.isRejectedForFraud;
  }

  get displayRescoringCertificationButton() {
    return Boolean(!this.args.certification.isPublished && this.args.session.finalizedAt);
  }

  @action
  onCancelConfirm() {
    this.displayConfirm = false;
  }

  @action
  async onCancelCertificationConfirmation() {
    try {
      await this.args.certification.save({ adapterOptions: { isCertificationCancel: true } });
      await this.args.certification.reload();
    } catch {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.certifications.global-actions.cancel.error-message'),
      });
    }

    this.displayConfirm = false;
  }

  @action
  onCancelCertificationButtonClick() {
    this.modalTitle = this.intl.t('components.certifications.global-actions.cancel.modal-title');
    this.confirmAction = this.onCancelCertificationConfirmation;
    this.confirmMessage = this.intl.t('components.certifications.global-actions.cancel.modal-message');
    this.displayConfirm = true;
  }

  @action
  async onUncancelCertificationConfirmation() {
    try {
      await this.args.certification.save({ adapterOptions: { isCertificationUncancel: true } });
      await this.args.certification.reload();
    } catch {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.certifications.global-actions.uncancel.error-message'),
      });
    }

    this.displayConfirm = false;
  }

  @action
  onUncancelCertificationButtonClick() {
    this.modalTitle = this.intl.t('components.certifications.global-actions.uncancel.modal-title');
    this.confirmAction = this.onUncancelCertificationConfirmation;
    this.confirmMessage = this.intl.t('components.certifications.global-actions.uncancel.modal-message');
    this.displayConfirm = true;
  }

  @action
  async onRejectCertificationConfirmation() {
    try {
      await this.args.certification.save({ adapterOptions: { isCertificationReject: true } });
      await this.args.certification.reload();
    } catch {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.certifications.global-actions.reject.error-message'),
      });
    }

    this.displayConfirm = false;
  }

  @action
  onRejectCertificationButtonClick() {
    this.modalTitle = this.intl.t('components.certifications.global-actions.reject.modal-title');
    this.confirmAction = this.onRejectCertificationConfirmation;
    this.confirmMessage = this.intl.t('components.certifications.global-actions.reject.modal-message');
    this.displayConfirm = true;
  }

  @action
  async onUnrejectCertificationConfirmation() {
    try {
      await this.args.certification.save({ adapterOptions: { isCertificationUnreject: true } });
      await this.args.certification.reload();
    } catch {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.certifications.global-actions.unreject.error-message'),
      });
    }

    this.displayConfirm = false;
  }

  @action
  onUnrejectCertificationButtonClick() {
    this.modalTitle = this.intl.t('components.certifications.global-actions.unreject.modal-title');
    this.confirmAction = this.onUnrejectCertificationConfirmation;
    this.confirmMessage = this.intl.t('components.certifications.global-actions.unreject.modal-message');
    this.displayConfirm = true;
  }

  @action
  async rescoreCertification() {
    try {
      const adapter = this.store.adapterFor('certification');
      await adapter.rescoreCertification({
        certificationCourseId: this.args.certification.id,
      });
      this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.certifications.global-actions.rescoring.success-message'),
      });
      await this.args.certification.reload();
    } catch {
      this.pixToast.sendErrorNotification({
        message: this.intl.t('components.certifications.global-actions.rescoring.error-message'),
      });
    }
  }

  <template>
    <PixButtonLink @route="authenticated.users.get" @size="small" @model={{@certification.userId}}>
      {{t "components.certifications.global-actions.user-details-link"}}
    </PixButtonLink>

    <div class="certification-information-global-actions">
      {{#if this.displayCancelCertificationButton}}
        <PixButton @variant="secondary" @size="small" @triggerAction={{this.onCancelCertificationButtonClick}}>
          {{t "components.certifications.global-actions.cancel.button"}}
        </PixButton>
      {{/if}}
      {{#if this.displayUncancelCertificationButton}}
        <PixButton @variant="error" @size="small" @triggerAction={{this.onUncancelCertificationButtonClick}}>
          {{t "components.certifications.global-actions.uncancel.button"}}
        </PixButton>
      {{/if}}
      {{#if this.displayUnrejectCertificationButton}}
        <PixButton @variant="error" @size="small" @triggerAction={{this.onUnrejectCertificationButtonClick}}>
          {{t "components.certifications.global-actions.unreject.button"}}
        </PixButton>
      {{/if}}
      {{#if this.displayRejectCertificationButton}}
        <PixButton @variant="error" @size="small" @triggerAction={{this.onRejectCertificationButtonClick}}>
          {{t "components.certifications.global-actions.reject.button"}}
        </PixButton>
      {{/if}}
      {{#if this.displayRescoringCertificationButton}}
        <PixButton @size="small" @triggerAction={{this.rescoreCertification}}>
          {{t "components.certifications.global-actions.rescoring.button"}}
        </PixButton>
      {{/if}}
    </div>

    <ConfirmPopup
      @title={{this.modalTitle}}
      @message={{this.confirmMessage}}
      @error={{this.confirmErrorMessage}}
      @confirm={{this.confirmAction}}
      @show={{this.displayConfirm}}
      @cancel={{this.onCancelConfirm}}
    />
  </template>
}
