import { pageTitle } from 'ember-page-title';

import Nav from './nav';

<template>
  {{pageTitle "Administration"}}
  <div class="page">
    <header class="page-header">
      <h1 class="page-title">Administration</h1>
      <div class="page-actions">
      </div>
    </header>

    <main class="page-body">
      <Nav />
      {{yield}}
    </main>
  </div>
</template>
