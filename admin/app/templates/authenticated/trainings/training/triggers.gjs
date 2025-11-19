import CreateTrainingTriggers from 'pix-admin/components/trainings/create-training-triggers';
<template>
  {{#if @controller.showTriggersEditForm}}
    {{outlet}}
  {{else if @controller.canCreateTriggers}}
    <CreateTrainingTriggers @training={{@controller.model}} />
  {{/if}}
</template>
