import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
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
  </section>
</template>
