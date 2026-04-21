import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Breadcrumb from 'pix-admin/components/networks/breadcrumb';
import HeadInformation from 'pix-admin/components/networks/head-information';
import InformationView from 'pix-admin/components/networks/information-view';
<template>
  {{pageTitle (t "pages.networks.get.page-title") " " @model.id}}
  <header class="header page-header">
    <Breadcrumb @currentPageLabel={{@model.name}} />
  </header>

  <section class="networks-get-page-layout">

    <HeadInformation @network={{@model}} />
    <InformationView @network={{@model}} />
  </section>
</template>
