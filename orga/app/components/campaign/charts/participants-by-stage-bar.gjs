import { fn } from '@ember/helper';
import { on } from '@ember/modifier';

<template>
  <div class="participants-by-stage__graph" role="button" {{on "click" (fn @onClickBar @stageId)}} ...attributes>
    <div class="participants-by-stage__bar" style={{@barWidth}} aria-hidden="true"></div>
    <div class="participants-by-stage__percentage">
      {{yield}}
    </div>
  </div>
</template>
