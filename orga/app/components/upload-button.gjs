import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import { t } from 'ember-intl';

function fileTypes(supportedFormats, separator) {
  return { types: supportedFormats.join(separator) };
}

<template>
  {{#if @disabled}}
    <PixButton ...attributes @size={{@size}} @isDisabled={{@disabled}} aria-describedby="{{@id}}-accept-files">
      {{yield}}
    </PixButton>
  {{else}}
    <PixButtonUpload ...attributes @size={{@size}} @id={{@id}} @onChange={{@onChange}} accept={{@supportedFormats}}>
      {{yield}}
    </PixButtonUpload>
  {{/if}}
  <p class="import-card__accepted-files" id="{{@id}}-accept-files">
    {{t
      "pages.organization-participants-import.supported-formats"
      (fileTypes @supportedFormats (t "pages.organization-participants-import.file-type-separator"))
    }}
  </p>
</template>
