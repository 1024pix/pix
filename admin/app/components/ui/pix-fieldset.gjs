 // move this component to Pix UI Later
import { t } from 'ember-intl';

<template>
  <fieldset class="pix-fieldset" ...attributes>
    <legend id="external-ids-label" class="pix-fieldset__label">
      {{#if @required}}
        <abbr title={{t "common.form.mandatory-fields-title"}} class="mandatory-mark" aria-hidden="true">*</abbr>
      {{/if}}
      {{yield to="title"}}
    </legend>

    {{yield to="content"}}
  </fieldset>
</template>
