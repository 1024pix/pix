import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { eq } from 'ember-truth-helpers';

<template>
  <button
    class="pix-tabs__tab"
    id="{{@id}}-{{@index}}"
    type="button"
    role="tab"
    aria-selected={{if (eq @currentTab @index) "true" "false"}}
    aria-controls="panel-{{@id}}-{{@index}}"
    tabindex={{if (eq @currentTab @index) "0" "-1"}}
    {{on "click" (fn @onTabClick @index)}}
  >
    <span>
      {{yield}}
    </span>
  </button>
</template>
