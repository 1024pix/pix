import t from 'ember-intl/helpers/t';

<template>
  <h2 class="version-creation-form__title">
    {{t "components.certification-frameworks.certification-framework.versions.page-title" scope=@model.frameworkKey}}
  </h2>
  {{outlet}}
</template>
