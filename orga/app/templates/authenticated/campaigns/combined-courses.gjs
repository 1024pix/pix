import { PixPagination } from '@1024pix/nebulix-ember';
import { t } from 'ember-intl';
import { pageTitle } from 'ember-page-title';
import ListHeader from 'pix-orga/components/campaign/list-header';
import CombinedCourseList from 'pix-orga/components/combined-course/list';

<template>
  {{pageTitle (t "pages.campaign.tab.combined-courses")}}

  <article>
    <ListHeader />
    <CombinedCourseList @combinedCourses={{@model.combinedCourses}} />
    <PixPagination @pagination={{@model.combinedCourses.meta}} />
  </article>
</template>
