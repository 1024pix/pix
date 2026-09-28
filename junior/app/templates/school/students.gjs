import { PixButton } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Bubble from 'junior/components/bubble';
import RobotDialog from 'junior/components/robot-dialog';
import WidthLimitedContent from 'junior/components/width-limited-content';
<template>
  {{pageTitle (t "pages.school.student-list.page-title")}}
  <WidthLimitedContent>
    <div class="school">
      <RobotDialog>
        <Bubble @message={{t "pages.school.student-list.find-name" division=@model.division}} />
        <Bubble @message={{t "pages.school.student-list.back-to-divisions" backUrl=@model.schoolUrl}} />
      </RobotDialog>
      <div class="list">
        {{#each @model.organizationLearners as |learner|}}
          <PixButton @triggerAction={{fn @controller.identifyUser learner}} class="students__item">
            <p>{{learner.displayName}}</p>
          </PixButton>
        {{/each}}
      </div>
    </div>
  </WidthLimitedContent>
</template>
