import t from 'ember-intl/helpers/t';
import Breadcrumb from 'pix-orga/components/ui/breadcrumb';
import LearnerHeaderInfo from 'pix-orga/components/ui/learner-header-info';
import PageTitle from 'pix-orga/components/ui/page-title';
<template>
  <article>
    <PageTitle>
      <:breadcrumb>
        <Breadcrumb @links={{@controller.breadcrumbLinks}} />
      </:breadcrumb>

      <:title>
        {{t "common.fullname" firstName=@model.firstName lastName=@model.lastName}}
      </:title>

      <:tools>
        <LearnerHeaderInfo @isCertifiable={{@model.isCertifiable}} @certifiableAt={{@model.certifiableAt}} />
      </:tools>
    </PageTitle>
    {{outlet}}
  </article>
</template>
