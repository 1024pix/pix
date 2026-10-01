import { PixButtonLink, PixNotificationAlert } from '@1024pix/nebulix-ember';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import AddStudentList from 'pix-certif/components/add-student-list';

<template>
  {{pageTitle @controller.pageTitle replace=true}}
  <div class='add-student'>
    <PixButtonLink
      @route='authenticated.sessions.details.certification-candidates'
      @model={{@model.session.id}}
      @variant='tertiary'
      @iconBefore='arrowLeft'
      class='previous-button hide-on-mobile'
    >
      {{t 'common.sessions.actions.return-to'}}
    </PixButtonLink>

    <h1 class='page-title'>{{t 'pages.sco.enrol-candidates-in-session.title'}}</h1>
    <PixNotificationAlert @type='info' @withIcon={{true}} class='add-student__info-message'>
      {{t 'pages.sco.enrol-candidates-in-session.information' htmlSafe=true}}
      <a href={{@controller.supportUrl}} target='_blank' rel='noopener noreferrer'>
        {{t 'pages.sco.enrol-candidates-in-session.link-label'}}
        <span class='screen-reader-only'>{{t 'navigation.external-link-title'}}</span>
      </a>
    </PixNotificationAlert>

    <AddStudentList
      @studentList={{@model.students}}
      @session={{@model.session}}
      @numberOfEnrolledStudents={{@model.numberOfEnrolledStudents}}
      @certificationCenterDivisions={{@model.certificationCenterDivisions}}
      @returnToSessionCandidates={{@controller.returnToSessionCandidates}}
      @selectedDivisions={{@model.selectedDivisions}}
    />
  </div>
</template>
