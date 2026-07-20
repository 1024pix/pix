import pageTitle from 'ember-page-title/helpers/page-title';
import Breadcrumb from 'pix-admin/components/certification-centers/breadcrumb';
import Get from 'pix-admin/components/certification-centers/get';
<template>
  {{pageTitle "Centre " @model.certificationCenter.id}}
  <header class="page-header">
    <Breadcrumb @currentPageLabel={{@model.certificationCenter.name}} />
  </header>
  <Get @certificationCenter={{@model.certificationCenter}}>
    <:outlet>
      {{outlet}}
    </:outlet>
  </Get>
</template>
