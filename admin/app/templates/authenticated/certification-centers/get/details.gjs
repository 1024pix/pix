import pageTitle from 'ember-page-title/helpers/page-title';
import Information from 'pix-admin/components/certification-centers/information';

<template>
  {{pageTitle "Centre " @model.certificationCenter.id}}
  <p>POUET</p>
  <Information
    @availableHabilitations={{@model.habilitations}}
    @certificationCenter={{@model.certificationCenter}}
    @updateCertificationCenter={{@controller.updateCertificationCenter}}
    @refreshModel={{@controller.refresh}}
  />
</template>
