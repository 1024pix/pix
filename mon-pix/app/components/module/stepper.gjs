import Step from 'mon-pix/components/module/step';
import { inc } from 'mon-pix/helpers/inc';

<template>
  {{#each @steps as |step index|}}
    <Step @step={{step}} @currentStep={{inc index}} @totalSteps={{@steps.length}} />
  {{/each}}
</template>
