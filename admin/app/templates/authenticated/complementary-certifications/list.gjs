import t from 'ember-intl/helpers/t';
import List from 'pix-admin/components/complementary-certifications/list';
<template>
  <header>
    <h1>{{t "components.complementary-certifications.title"}}</h1>
  </header>

  <main class="page-body">
    <section class="page-section">
      <List @complementaryCertifications={{@model}} />
    </section>
  </main>
</template>
