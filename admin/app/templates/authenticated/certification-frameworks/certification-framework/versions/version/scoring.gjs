import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { t } from 'ember-intl';
import CompetencesScoringForm from 'pix-admin/components/certification-frameworks/certification-framework/versions/certification-version-competences-scoring-form';
import GlobalScoringForm from 'pix-admin/components/certification-frameworks/certification-framework/versions/certification-version-global-scoring-form';

<template>
  <GlobalScoringForm
    @editVersion={{@model.editVersion}}
    @previousVersion={{@model.previousVersion}}
    @calibrationScoringConfiguration={{@model.calibrationScoringConfiguration}}
  />
  {{#if @model.editVersion.isCoreScope}}
    <CompetencesScoringForm
      @editVersion={{@model.editVersion}}
      @calibrationScoringConfiguration={{@model.calibrationScoringConfiguration}}
    />
  {{/if}}
  <section class="actions-container">
    <PixButtonLink @route="authenticated.certification-frameworks.certification-framework" @variant="secondary">
      {{t "common.actions.cancel"}}
    </PixButtonLink>
    {{#if @model.editVersion.isActive}}
      <PixButton
        id="save-scoring"
        @variant="primary-bis"
        @isDisabled={{@controller.hasGlobalScoringError}}
        @triggerAction={{@controller.toggleSaveScoringModal}}
      >
        {{t "components.certification-frameworks.certification-framework.versions.scoring.save-scoring-button"}}
      </PixButton>
    {{else}}
      <PixButton
        id="activate-version"
        @variant="primary-bis"
        @isDisabled={{@controller.hasGlobalScoringError}}
        @triggerAction={{@controller.toggleActivationModal}}
      >
        {{t "components.certification-frameworks.certification-framework.versions.activate-version.button-label"}}
      </PixButton>
    {{/if}}
  </section>

  {{#if @controller.isSaveScoringModalOpen}}
    <PixModal
      @title={{t
        "components.certification-frameworks.certification-framework.versions.scoring.save-scoring-modal.title"
      }}
      @showModal={{@controller.isSaveScoringModalOpen}}
      @onCloseButtonClick={{@controller.toggleSaveScoringModal}}
    >
      <:content>
        <p>{{t
            "components.certification-frameworks.certification-framework.versions.scoring.save-scoring-modal.content"
          }}</p>
      </:content>
      <:footer>
        <PixButton @triggerAction={{@controller.toggleSaveScoringModal}} @size="small" @variant="secondary">
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @triggerAction={{@controller.saveScoring}} @size="small">
          {{t "common.actions.confirm"}}
        </PixButton>
      </:footer>
    </PixModal>
  {{/if}}

  {{#if @controller.isActivationModalOpen}}
    <PixModal
      @title={{t
        "components.certification-frameworks.certification-framework.versions.activate-version.confirmation-modal.title"
      }}
      @showModal={{@controller.isActivationModalOpen}}
      @onCloseButtonClick={{@controller.toggleActivationModal}}
    >
      <:content>
        <p>{{t
            "components.certification-frameworks.certification-framework.versions.activate-version.confirmation-modal.content"
          }}</p>
      </:content>
      <:footer>
        <PixButton @triggerAction={{@controller.toggleActivationModal}} @size="small" @variant="secondary">
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @triggerAction={{@controller.saveScoringAndActivate}} @size="small">
          {{t "common.actions.confirm"}}
        </PixButton>
      </:footer>
    </PixModal>
  {{/if}}
</template>
