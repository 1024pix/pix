import TargetProfile from 'pix-admin/components/target-profiles/target-profile';
<template>
  {{#if @controller.showTargetProfile}}
    <TargetProfile @model={{@model}}>
      {{outlet}}
    </TargetProfile>
  {{else}}
    {{outlet}}
  {{/if}}
</template>
