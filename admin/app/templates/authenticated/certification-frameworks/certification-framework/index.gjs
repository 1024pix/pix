import Header from 'pix-admin/components/certification-frameworks/item/header';
import Framework from 'pix-admin/components/certification-frameworks/item/framework';

<template>
  <div class="page">
    <Header
      @certificationFramework={{@model.currentCertificationFramework}}
      @frameworkHistory={{@model.frameworkHistory}}
    />

    <section class="page-body certification-framework">
      <Framework
        @frameworkKey={{@model.frameworkKey}}
        @certificationFramework={{@model.currentCertificationFramework}}
        @hasTargetProfilesHistory={{@model.hasTargetProfilesHistory}}
        @frameworkHistory={{@model.frameworkHistory}}
      />
    </section>
  </div>
</template>
