import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Breadcrumb from 'pix-admin/components/certification-centers/breadcrumb';
import CreationForm from 'pix-admin/components/certification-centers/creation-form';
<template>
  {{pageTitle (t "pages.certification-centers.new.page-title")}}
  <header class="page-header">
    <Breadcrumb @currentPageLabel="Nouveau centre de certification" />
  </header>

  <h1 class="pix-title-s">{{t "pages.certification-centers.new.page-title"}}</h1>

  <CreationForm
    class="main-admin-form"
    @habilitations={{@model.habilitations}}
    @onCancel={{@controller.goBackToCertificationCentersList}}
  />
</template>
