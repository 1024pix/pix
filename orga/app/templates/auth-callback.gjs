<template>
  {{#if @model.error}}
    <h1>Gestion des erreurs liées à OAuth</h1>
    <p>{{@model.error}} - {{@model.error_description}}</p>
  {{else}}
    <p>loading</p>
  {{/if}}
</template>
