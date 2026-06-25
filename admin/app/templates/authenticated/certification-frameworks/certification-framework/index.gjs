import Framework from 'pix-admin/components/certification-frameworks/certification-framework/framework';
import Header from 'pix-admin/components/certification-frameworks/certification-framework/header';

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
