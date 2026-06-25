import t from 'ember-intl/helpers/t';
import CertificationVersionEditForm from 'pix-admin/components/certification-frameworks/item/framework/certification-version-edit-form';

<template>
  <h2 class="framework-creation-form__title">
    {{t "components.certification-frameworks.item.frameworks.version-edit-form.page-title" scope=@model.scope}}
  </h2>
  <CertificationVersionEditForm />
</template>
