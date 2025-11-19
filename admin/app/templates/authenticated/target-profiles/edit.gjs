import pageTitle from 'ember-page-title/helpers/page-title';
import Breadcrumb from 'pix-admin/components/target-profiles/breadcrumb';
import EditTargetProfileForm from 'pix-admin/components/target-profiles/edit-target-profile-form';
<template>
  {{pageTitle "Modification du profil cible : " @model.targetProfile.internalName}}

  <header class="page-header">
    <Breadcrumb @targetProfile={{@model.targetProfile}} @currentPageLabel="Modification du profil cible" />
  </header>

  <main class="main-admin-form">
    <EditTargetProfileForm
      @targetProfile={{@controller.model.targetProfile}}
      @frameworks={{@controller.model.frameworks}}
      @onSubmit={{@controller.editTargetProfile}}
      @onCancel={{@controller.goBackToTargetProfilePage}}
      @updateMode={{true}}
    />
  </main>
</template>
