import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import { t } from 'ember-intl';

<template>
  <form class="flash-algorithm-configuration-form">
    <PixInput
      {{on "input" @updateNumberValues}}
      @id="maximumAssessmentLength"
      @value={{@form.maximumAssessmentLength}}
      type="number"
      min="0"
    >
      <:label>{{t
          "pages.administration.certification.flash-algorithm-configuration.form.maximumAssessmentLength"
        }}</:label>
    </PixInput>

    <PixInput {{on "input" @updateNumberValues}} @id="warmUpLength" @value={{@form.warmUpLength}} type="number" min="0">
      <:label>{{t "pages.administration.certification.flash-algorithm-configuration.form.warmUpLength"}}</:label>
    </PixInput>

    <PixInput
      {{on "input" @updateNumberValues}}
      @id="challengesBetweenSameCompetence"
      @value={{@form.challengesBetweenSameCompetence}}
      type="number"
      min="0"
    >
      <:label>{{t
          "pages.administration.certification.flash-algorithm-configuration.form.challengesBetweenSameCompetence"
        }}</:label>
    </PixInput>

    <PixInput
      {{on "input" @updateNumberValues}}
      @id="variationPercent"
      @value={{@form.variationPercent}}
      type="number"
      min="0"
    >
      <:label>{{t "pages.administration.certification.flash-algorithm-configuration.form.variationPercent"}}</:label>
    </PixInput>

    <PixInput
      {{on "input" @updateNumberValues}}
      @id="variationPercentUntil"
      @value={{@form.variationPercentUntil}}
      type="number"
      min="0"
    >
      <:label>{{t
          "pages.administration.certification.flash-algorithm-configuration.form.variationPercentUntil"
        }}</:label>
    </PixInput>

    <PixInput
      {{on "input" @updateNumberValues}}
      @id="doubleMeasuresUntil"
      @value={{@form.doubleMeasuresUntil}}
      type="number"
      min="0"
    >
      <:label>{{t "pages.administration.certification.flash-algorithm-configuration.form.doubleMeasuresUntil"}}</:label>
    </PixInput>

    <PixCheckbox
      {{on "input" @updateCheckboxValues}}
      @id="limitToOneQuestionPerTube"
      @value={{@form.limitToOneQuestionPerTube}}
      checked={{@form.limitToOneQuestionPerTube}}
    >
      <:label>{{t
          "pages.administration.certification.flash-algorithm-configuration.form.limitToOneQuestionPerTube"
        }}</:label>
    </PixCheckbox>

    <PixCheckbox
      {{on "input" @updateCheckboxValues}}
      @id="enablePassageByAllCompetences"
      @value={{@form.enablePassageByAllCompetences}}
      checked={{@form.enablePassageByAllCompetences}}
    >
      <:label>{{t
          "pages.administration.certification.flash-algorithm-configuration.form.enablePassageByAllCompetences"
        }}</:label>
    </PixCheckbox>

    <PixButton
      class="scoring-simulator__form-button"
      @type="submit"
      @triggerAction={{@onCreateFlashAlgorithmConfiguration}}
    >{{t "common.actions.save"}}</PixButton>
  </form>
</template>
