import VersionCreateForm from 'pix-admin/components/certification-frameworks/certification-framework/versions/certification-version-create-form';

<template>
  <VersionCreateForm
    @frameworks={{@model.frameworks}}
    @scope={{@model.scope}}
    @activeVersion={{@model.activeVersion}}
  />
</template>
