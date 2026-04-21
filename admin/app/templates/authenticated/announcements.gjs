import { pageTitle } from 'ember-page-title';

const title = "Bandeau d'annonce Orga";

<template>
  {{pageTitle title}}
  <div class="page">
    <header class="header">
      <h1>{{title}}</h1>
    </header>
    <main class="page-body">
      {{outlet}}
    </main>
  </div>
</template>
