import AttachedCertificationCenter from 'pix-admin/components/organizations/attached-certification-center';

<template>
  <AttachedCertificationCenter
    @attachedCertificationCenters={{@model.attachedCertificationCenters}}
    @organizationId={{@model.organizationId}}
  />
</template>
