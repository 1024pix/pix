import pageTitle from 'ember-page-title/helpers/page-title';

<template>
  {{pageTitle "Référentiel " @model.scope " | Pix Admin" replace=true}}
  {{outlet}}
</template>
