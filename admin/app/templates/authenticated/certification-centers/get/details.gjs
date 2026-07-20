import Information from 'pix-admin/components/certification-centers/information';

<template>
  <Information
    @availableHabilitations={{@model.habilitations}}
    @certificationCenter={{@model.certificationCenter}}
    @updateCertificationCenter={{@controller.updateCertificationCenter}}
    @refreshModel={{@controller.refresh}}
  />
</template>
