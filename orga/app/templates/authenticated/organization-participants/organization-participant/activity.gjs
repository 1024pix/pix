import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Activity from 'pix-orga/components/organization-learner/activity';
<template>
  {{pageTitle (t "pages.organization-participant-activity.title")}}

  <Activity
    @participations={{@model.organizationLearnerParticipations}}
    @learner={{@model.organizationLearner}}
    @statistics={{@model.organizationLearnerStatistics}}
  />
</template>
