import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import pageTitle from 'ember-page-title/helpers/page-title';
import Breadcrumb from 'pix-admin/components/trainings/breadcrumb';
import CreateOrUpdateTrainingForm from 'pix-admin/components/trainings/create-or-update-training-form';
<template>
  {{pageTitle "Nouveau contenu formatif"}}
  <header class="page-header">
    <Breadcrumb @currentPageLabel="Création du contenu" />

    <div class="page-actions">
      <a
        class="page-actions__link"
        href="https://1024pix.atlassian.net/wiki/spaces/PROD/pages/3753476097/Cr+er+un+contenu+formatif+Mode+d+emploi"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Consulter la documentation de création de contenus formatifs (ouverture dans une nouvelle fenêtre)"
      >
        Consulter la documentation
        <PixIcon @name="openNew" @ariaHidden={{true}} />
      </a>
    </div>
  </header>

  <main class="main-admin-form">
    <CreateOrUpdateTrainingForm
      @onSubmit={{@controller.createOrUpdateTraining}}
      @onCancel={{@controller.goBackToTrainingList}}
    />
  </main>
</template>
