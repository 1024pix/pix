import { PixTooltip } from '@1024pix/nebulix-ember';
import { hash } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Bubble from 'junior/components/bubble';
import RobotDialog from 'junior/components/robot-dialog';
import SchoolCodeError from 'junior/components/school-code-error';
import WidthLimitedContent from 'junior/components/width-limited-content';
<template>
  {{#if @model.error}}
    <SchoolCodeError @refreshAction={{@controller.refreshModel}} />
  {{else}}
    {{pageTitle (t "pages.school.division-list.page-title")}}
    <WidthLimitedContent>
      <div class="school">
        <RobotDialog>
          <Bubble @message={{t "pages.school.division-list.welcome" schoolName=@model.name}} />
        </RobotDialog>
        <div class="list">
          {{#each @model.divisions as |division|}}
            <LinkTo @route="school.students" @query={{hash division=division}}>
              <PixTooltip @isInline={{true}}>
                <:triggerElement>
                  <div class="divisions__item">
                    <p class="item__title">{{division}}</p>

                  </div>
                </:triggerElement>

                <:tooltip>
                  {{division}}
                </:tooltip>
              </PixTooltip>
            </LinkTo>

          {{/each}}
        </div>
      </div>
    </WidthLimitedContent>
  {{/if}}
</template>
