import t from 'ember-intl/helpers/t';

<template>
  <h2 class="framework-creation-form__title">
    {{t "components.certification-frameworks.item.frameworks.version-edit-form.page-title" scope=@model.frameworkKey}}
  </h2>
  {{outlet}}
</template>
