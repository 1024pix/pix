import CompanionBlocker from '../companion/blocker';

<template>
  {{#if @assessment.isCertification}}
    <CompanionBlocker>
      {{yield}}
    </CompanionBlocker>
  {{else}}
    {{yield}}
  {{/if}}
</template>
