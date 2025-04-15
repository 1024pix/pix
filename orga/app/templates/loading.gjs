import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import PixLoader from 'pix-orga/components/ui/pix-loader';
<template>
  {{pageTitle (t "common.loading")}}
  <PixLoader />
</template>
