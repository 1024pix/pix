import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Activity from 'pix-orga/components/organization-learner/activity';
<template>
  {{pageTitle (t "pages.sup-organization-participant-activity.title")}}

  <Activity
    @participations={{@model.activity.organizationLearnerParticipations}}
    @learner={{@model.organizationLearner}}
    @statistics={{@model.activity.organizationLearnerStatistics}}
  />
</template>
