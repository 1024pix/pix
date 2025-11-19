import pageTitle from 'ember-page-title/helpers/page-title';
import Timeline from 'pix-admin/components/candidates/timeline';
<template>
  {{pageTitle @controller.pageTitle replace=true}}
  <Timeline @timeline={{@controller.model}} />
</template>
