import { LinkTo } from '@ember/routing';
import { pageTitle } from 'ember-page-title';

import MenuBar from './menu-bar';

<template>
  {{pageTitle "Pix Admin" separator=" | "}}
  <div class="app-container">

    <aside class="app-sidebar">
      <header class="header app-logo">
        <LinkTo @route="authenticated.index" class="app-logo__link">
          PIX
        </LinkTo>
      </header>
      <MenuBar />
    </aside>

    <div class="app-body">
      <div class="page">
        {{yield}}
      </div>
    </div>
  </div>
</template>
