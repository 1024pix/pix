import pageTitle from 'ember-page-title/helpers/page-title';
import Breadcrumb from 'pix-admin/components/target-profiles/breadcrumb';
import EditTargetProfileForm from 'pix-admin/components/target-profiles/edit-target-profile-form';
<template>
  {{pageTitle "Nouveau profil cible"}}
  <header class="page-header">
    <Breadcrumb @currentPageLabel="Nouveau profil cible" />
  </header>

  <main class="main-admin-form">
    <EditTargetProfileForm
      @targetProfile={{@controller.model.targetProfile}}
      @frameworks={{@controller.model.frameworks}}
      @onSubmit={{@controller.createTargetProfile}}
      @onCancel={{@controller.goBackToTargetProfileList}}
    />
  </main>
</template>
