import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Content from 'mon-pix/components/attestations/content';

<template>
  {{pageTitle (t "pages.attestations.title")}}

  <Content @attestationsDetails={{@model}} />
</template>
