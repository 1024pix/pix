import CampaignName from './campaign-name';
import CourseSelection from './course-selection';

<template>
  <CourseSelection @campaign={{@campaign}} @errors={{@errors}} @tab="blueprint" />

  {{#if @campaign.course}}
    <CampaignName @campaign={{@campaign}} @errors={{@errors}} />
  {{/if}}
</template>
