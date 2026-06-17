import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';
import { pageTitle } from 'ember-page-title';
import TrainingBreadCrumb from 'pix-admin/components/trainings/breadcrumb';
import StateTag from 'pix-admin/components/trainings/state-tag';

<template>
  {{pageTitle "Détail du contenu formatif " @model.id}}

  <header class="page-header">
    <TrainingBreadCrumb @currentPageLabel={{@model.id}} />

    <div class="page-actions">
      <PixButtonLink
        @variant="secondary"
        @iconAfter="openNew"
        href="https://1024pix.atlassian.net/wiki/spaces/PROD/pages/3753476097/Cr+er+un+contenu+formatif+Mode+d+emploi"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Consulter la documentation de création de contenus formatifs (ouverture dans une nouvelle fenêtre)"
      >
        Consulter la documentation
      </PixButtonLink>
    </div>
  </header>

  <main class="page-body">

    <PixBlock @variant="admin" class="training-header-information">
      <div class="training-header-information__editor-logo">
        <img src={{@model.editorLogoUrl}} alt={{@model.editorName}} />
      </div>
      <div>
        <h1 class="training-header-information__title">{{@model.internalTitle}}</h1>
        <StateTag @isDisabled={{@model.isDisabled}} />
      </div>
    </PixBlock>
    <PixTabs @variant="primary" @ariaLabel="Navigation de la section détails d'un contenu formatif" class="navigation">
      <LinkTo @route="authenticated.trainings.training.details" @model={{@model}}>
        {{t "pages.trainings.training.details.tab"}}
      </LinkTo>
      <LinkTo @route="authenticated.trainings.training.triggers" @model={{@model}}>
        {{t "pages.trainings.training.triggers.tabName"}}
      </LinkTo>
      <LinkTo @route="authenticated.trainings.training.target-profiles" @model={{@model}}>
        {{t "pages.trainings.training.targetProfiles.tabName"}}
      </LinkTo>
    </PixTabs>

    {{outlet}}
  </main>
</template>
