import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Card from 'mon-pix/components/training/card';
import Header from 'mon-pix/components/training/header';
import PaginationWrapper from 'mon-pix/components/ui/pagination-wrapper';
<template>
  {{pageTitle (t "pages.user-trainings.title")}}

  <main id="main" class="main" role="main">
    <Header />
    {{#if @model.trainings.meta.pagination.rowCount}}
      <div class="user-trainings-content">
        <ul class="user-trainings-content__list">
          {{#each @model.trainings as |training|}}
            <li class="user-trainings-content-list__item">
              <Card @training={{training}} />
            </li>
          {{/each}}
        </ul>
        <PaginationWrapper
          @pagination={{@model.trainings.meta.pagination}}
          @pageOptions={{@controller.pageOptions}}
          @isCondensed="true"
        />
      </div>
    {{/if}}
  </main>
</template>
