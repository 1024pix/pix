import Framework from 'pix-admin/components/certification-frameworks/item/framework';

<template>
  <Framework
    @frameworkKey={{@model.frameworkKey}}
    @certificationFramework={{@model.currentCertificationFramework}}
    @hasTargetProfilesHistory={{@model.hasTargetProfilesHistory}}
    @frameworkHistory={{@model.frameworkHistory}}
  />
</template>
