import Step from 'mon-pix/components/module/step';

<template>
  {{#each @steps as |step|}}
    <Step @step={{step}} @currentStep={{1}} @totalSteps={{4}} />
  {{/each}}
</template>
