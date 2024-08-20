import PixTag from '@1024pix/pix-ui/components/pix-tag';

<template>
  <div class="certification-informations__tag--float">
    {{#if @record.isPublished}}
      <PixTag @color="success">Publiée</PixTag>
    {{/if}}
    {{#if @record.isCancelled}}
      <PixTag @color="error">Annulée</PixTag>
    {{/if}}
  </div>
</template>
