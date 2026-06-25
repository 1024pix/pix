import pageTitle from 'ember-page-title/helpers/page-title';

<template>
  {{pageTitle "Référentiel " @model.frameworkKey " | Pix Admin" replace=true}}
  {{outlet}}
</template>
