import { t } from 'ember-intl';

<template>
  {{! TODO: move this component to Pix UI Later }}
  <fieldset class="pix-fieldset" ...attributes>
    <legend class="pix-fieldset__label">
      {{yield to="title"}}
      {{#if @required}}
        <abbr title={{t "common.form.mandatory-fields-title"}} class="mandatory-mark" aria-hidden="true">*</abbr>
      {{/if}}
    </legend>

    {{yield to="content"}}
  </fieldset>
</template>
