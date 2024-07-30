import { eq, notEq } from 'ember-truth-helpers';

<template>
  <div
    role="tabpanel"
    class="pix-tabs__tabpanel"
    id="panel-{{@id}}-{{@index}}"
    tabindex={{if (eq @currentTab @index) "0" "-1"}}
    aria-labelledby="{{@id}}-{{@index}}"
    hidden={{notEq @currentTab @index}}
  >
    {{yield}}
  </div>
</template>
