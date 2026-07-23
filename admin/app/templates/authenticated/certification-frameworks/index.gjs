import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import List from 'pix-admin/components/certification-frameworks/list';

<template>
  {{pageTitle (t "components.certification-frameworks.page-title")}}

  <div class="page">
    <header>
      <h1>{{t "components.certification-frameworks.page-title"}}</h1>
    </header>

    <main class="page-body">
      <section class="page-section">
        <List @certificationFrameworks={{@model}} />
      </section>
    </main>
  </div>
</template>
