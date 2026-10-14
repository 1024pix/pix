import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import AnswerStatuses from 'mon-pix/components/assessments/answer-statuses';
import ComparisonWindow from 'mon-pix/components/assessments/comparison-window';
import AssessmentBanner from 'mon-pix/components/ui/assessment/banner';
<template>
  {{pageTitle (t "pages.assessment-results.title")}}

  <main>
    <AssessmentBanner
      @assessment={{@model}}
      @displayHomeLink={{false}}
      @isEnded={{true}}
      @displayTextToSpeechActivationButton={{false}}
    />

    <AnswerStatuses
      @shouldDisplayAnswers={{true}}
      @answers={{@model.answers}}
      @openAnswerDetails={{@controller.openComparisonWindow}}
      @isStaticCourse={{true}}
      @isDemo={{@model.isDemo}}
    />

    <ComparisonWindow
      @answer={{@controller.answer}}
      @closeComparisonWindow={{@controller.closeComparisonWindow}}
      @showModal={{@controller.isShowingModal}}
    />
  </main>
</template>
