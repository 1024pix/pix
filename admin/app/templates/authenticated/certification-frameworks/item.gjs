import pageTitle from 'ember-page-title/helpers/page-title';
import Header from 'pix-admin/components/certification-frameworks/item/header';

<template>
  {{pageTitle "Référentiel " @model.frameworkKey " | Pix Admin" replace=true}}

  <div class="page">
    <Header
      @certificationFramework={{@model.currentCertificationFramework}}
      @frameworkHistory={{@model.frameworkHistory}}
      @showCreationVersionButton={{@controller.showCreationVersionButton}}
    />

    <section class="page-body certification-framework">
      {{outlet}}
    </section>
  </div>
</template>
