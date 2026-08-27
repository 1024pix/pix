import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { t } from 'ember-intl';
import CompetencesScoringForm from 'pix-admin/components/certification-frameworks/certification-framework/versions/certification-version-competences-scoring-form';
import GlobalScoringForm from 'pix-admin/components/certification-frameworks/certification-framework/versions/certification-version-global-scoring-form';

<template>
  <GlobalScoringForm
    @draftVersion={{@model.draftVersion}}
    @activeVersion={{@model.activeVersion}}
    @calibrationScoringConfiguration={{@model.calibrationScoringConfiguration}}
  />
  {{#if @model.draftVersion.isCoreScope}}
    <CompetencesScoringForm
      @draftVersion={{@model.draftVersion}}
      @calibrationScoringConfiguration={{@model.calibrationScoringConfiguration}}
    />
  {{/if}}
  <section class="actions-container">
    <PixButtonLink @route="authenticated.certification-frameworks.certification-framework" @variant="secondary">
      {{t "common.actions.cancel"}}
    </PixButtonLink>
    <PixButton
      id="activate-version"
      @variant="primary-bis"
      @isDisabled={{@controller.hasGlobalScoringError}}
      @triggerAction={{@controller.toggleConfirmationModal}}
    >
      {{t "components.certification-frameworks.certification-framework.versions.activate-version.button-label"}}
    </PixButton>
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
