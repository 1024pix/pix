import pageTitle from 'ember-page-title/helpers/page-title';
import Information from 'pix-admin/components/certification-centers/information';

<template>
  {{pageTitle "Détails"}}

  <Information
    @availableHabilitations={{@controller.model.habilitations}}
    @certificationCenter={{@controller.model.certificationCenter}}
    @updateCertificationCenter={{@controller.updateCertificationCenter}}
    @refreshModel={{@controller.refresh}}
  />
</template>
