import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import CandidateList from 'pix-certif/components/session-supervising/candidate-list';
import Header from 'pix-certif/components/session-supervising/header';

<template>
  {{pageTitle (t 'pages.session-supervising.title' sessionId=@model.id)}}

  <div class='session-supervising-page'>
    <Header @session={{@model}} @fetchInvigilatorKit={{@controller.fetchInvigilatorKit}} />
    <CandidateList
      @authorizeTestResume={{@controller.authorizeTestResume}}
      @endAssessmentByInvigilator={{@controller.endAssessmentByInvigilator}}
      @toggleCandidate={{@controller.toggleCandidate}}
      @candidates={{@model.certificationCandidates}}
      @sessionId={{@model.id}}
      @hasSessionExpired={{@model.hasExpired}}
    />
  </div>
</template>
