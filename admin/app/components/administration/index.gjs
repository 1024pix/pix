import { pageTitle } from 'ember-page-title';

import Nav from './nav';

<template>
  {{pageTitle "Administration"}}
  <div class="page">
    <header class="header">
      <h1>Administration</h1>
    </header>

    <main class="page-body">
      <Nav />
      {{yield}}
    </main>
  </div>
</template>
