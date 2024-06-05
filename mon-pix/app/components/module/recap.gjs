import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { t } from 'ember-intl';
import ModuleBetaBanner from 'mon-pix/components/module/beta-banner';
import ModuleObjectives from 'mon-pix/components/module/objectives';

<template>
  <ModuleBetaBanner />

  <main class="module-recap">
    <div class="module-recap__header">
      <FaIcon @icon="circle-check" class="module-recap-header__icon fa-3x" />
    </div>
    <h1 class="module-recap__title">{{t "pages.modulix.recap.title"}}</h1>

    <div class="module-recap__objectives">
      <p class="module-recap-objectives__subtitle">{{t "pages.modulix.recap.subtitle" htmlSafe=true}}</p>
      <ModuleObjectives @objectives={{@module.details.objectives}} />
    </div>
    <div class="module-recap__link-form">
      <PixButtonLink
        @size="large"
        target="_blank"
        @href="https://form-eu.123formbuilder.com/71180/modulix-experimentation?2850087={{@passage.id}}"
      >
        {{t "pages.modulix.recap.goToForm"}}
      </PixButtonLink>
    </div>
    <div class="module-recap__link-details">
      <PixButtonLink @model={{@module.id}} @size="large" @route="module.details" @variant="secondary">
        {{t "pages.modulix.recap.backToModuleDetails"}}
      </PixButtonLink>
    </div>
  </main>
</template>
