import pageTitle from 'ember-page-title/helpers/page-title';
import Breadcrumb from 'pix-admin/components/certification-centers/breadcrumb';
import CreationForm from 'pix-admin/components/certification-centers/creation-form';
<template>
  {{pageTitle "Nouveau Centre de certif"}}
  <header class="page-header">
    <Breadcrumb @currentPageLabel="Nouveau centre de certification" />
  </header>

  <main class="page-body">
    <section class="page-section">
      <CreationForm
        @habilitations={{@model.habilitations}}
        @onCancel={{@controller.goBackToCertificationCentersList}}
      />
    </section>
  </main>
</template>
