import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { t } from 'ember-intl';
import CertificationVersionCalibrationReport from 'pix-admin/components/certification-frameworks/certification-framework/versions/certification-version-calibration-report';

<template>
  <CertificationVersionCalibrationReport
    @draftVersion={{@model.draftVersion}}
    @calibrationReport={{@model.calibrationReport}}
  />
  <section class="actions-container">
    <PixButtonLink @route="authenticated.certification-frameworks.certification-framework" @variant="secondary">
      {{t "common.actions.cancel"}}
    </PixButtonLink>
    {{#if @controller.isPixPlusScope}}
      <PixButton
        id="activate-version"
        @variant="primary-bis"
        @isDisabled={{@controller.hasNoExternalCalibrationId}}
        @triggerAction={{@controller.toggleConfirmationModal}}
      >
        {{t "components.certification-frameworks.certification-framework.versions.activate-version.button-label"}}
      </PixButton>
    {{/if}}
    <PixButtonLink
      @route="authenticated.certification-frameworks.certification-framework.versions.version.scoring"
      @variant="primary"
      @isDisabled={{@controller.hasNoExternalCalibrationId}}
    >
      {{t "common.actions.next"}}
    </PixButtonLink>
  </section>

  {{#if @controller.isConfirmationModalOpen}}
    <PixModal
      @title={{t
      "components.certification-frameworks.certification-framework.versions.activate-version.confirmation-modal.title"
    }}
      @showModal={{@controller.isConfirmationModalOpen}}
      @onCloseButtonClick={{@controller.toggleConfirmationModal}}
    >
      <:content>
        <p>{{t
          "components.certification-frameworks.certification-framework.versions.activate-version.confirmation-modal.content"
        }}</p>
      </:content>
      <:footer>
        <PixButton @triggerAction={{@controller.toggleConfirmationModal}} @size="small" @variant="secondary">
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @triggerAction={{@controller.activateVersion}} @size="small">
          {{t "common.actions.confirm"}}
        </PixButton>
      </:footer>
    </PixModal>
  {{/if}}
</template>
