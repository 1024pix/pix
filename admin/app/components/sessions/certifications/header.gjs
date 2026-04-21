import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { not } from 'ember-truth-helpers';

import ConfirmPopup from '../../confirm-popup';

export default class CertificationsHeader extends Component {
  @service accessControl;
  @service intl;

  @tracked isModalDisplayed = false;
  @tracked confirmMessage = null;

  get canPublish() {
    return (
      this.args.juryCertificationSummaries.length > 0 &&
      this.args.juryCertificationSummaries.every((certification) => certification.canPublish) &&
      this.args.session.isFinalized
    );
  }

  @action
  displayConfirmationModal() {
    this.confirmMessage = this.args.session.isPublished
      ? this.intl.t('pages.certifications.modal-confirmation.unpublish-session-information')
      : this.intl.t('pages.certifications.modal-confirmation.publish-session-information');
    this.isModalDisplayed = true;
  }

  @action
  onModalCancel() {
    this.isModalDisplayed = false;
  }

  @action
  async toggleSessionPublication() {
    if (this.args.session.isPublished) {
      await this.args.unpublishSession();
    } else {
      await this.args.publishSession();
    }
    this.isModalDisplayed = false;
  }

  <template>
    <header class="header">
      <h2>{{t "pages.certifications.title"}}</h2>

      <div class="certification-list-page__header">
        {{#if @session.isPublished}}
          <PixTag @color="success">
            {{t "pages.certifications.session-state.published"}}
          </PixTag>
        {{else}}
          <PixTag @color="neutral">
            {{t "pages.certifications.session-state.not-published"}}
          </PixTag>
        {{/if}}

        {{#if this.accessControl.hasAccessToCertificationActionsScope}}
          {{#if @session.isPublished}}
            <PixButton @triggerAction={{this.displayConfirmationModal}}>{{t
                "pages.certifications.actions.unpublish-session"
              }}</PixButton>
          {{else}}
            <PixTooltip @position="left" @isWide={{true}} @hide={{this.canPublish}}>
              <:triggerElement>
                <PixButton @triggerAction={{this.displayConfirmationModal}} @isDisabled={{not this.canPublish}}>
                  {{t "pages.certifications.actions.publish-session.label"}}
                </PixButton>
              </:triggerElement>
              <:tooltip>
                {{t "pages.certifications.actions.publish-session.warning-information"}}
              </:tooltip>
            </PixTooltip>
          {{/if}}
        {{/if}}
      </div>
    </header>
    <ConfirmPopup
      @message={{this.confirmMessage}}
      @confirm={{this.toggleSessionPublication}}
      @cancel={{this.onModalCancel}}
      @show={{this.isModalDisplayed}}
    />
  </template>
}
