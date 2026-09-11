import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import CombinedCourseItem from 'mon-pix/components/combined-course/combined-course-item';
import { CombinedCourseItemTypes } from 'mon-pix/models/combined-course-item';

// POC: a nested combined course is not a destination any more, it is a group in the
// parent's list. Only the current group is expanded, and its activities are rendered
// with the very same component as in a standalone combined course.

// What a group is made of, shown when it is not expanded. Built from the child's real
// activities, so it never announces something the API did not compute.
const Composition = <template>
  <span class="combined-course-group__composition">
    {{#each @activities as |activity index|}}
      {{#if index}}
        <span class="combined-course-group__composition-separator" aria-hidden="true">›</span>
      {{/if}}
      <span class="combined-course-group__chip">
        {{#if activity.iconUrl}}
          <img src={{activity.iconUrl}} alt="" role="presentation" />
        {{/if}}
        {{#if (eq activity.type CombinedCourseItemTypes.CAMPAIGN)}}
          {{t "pages.combined-courses.items.group.diagnostic"}}
        {{else if (eq activity.type CombinedCourseItemTypes.FORMATION)}}
          {{t "pages.combined-courses.items.formation.title"}}
        {{else}}
          {{activity.title}}
        {{/if}}
      </span>
    {{/each}}
  </span>
</template>;

<template>
  <div
    class="combined-course-group
      {{if @isCurrent 'combined-course-group--current'}}
      {{if @item.isCompleted 'combined-course-group--completed'}}"
  >
    <div class="combined-course-group__header">
      <span class="combined-course-group__badge">
        <PixIcon @name="signpost" @plainIcon={{true}} @ariaHidden={{true}} />
      </span>
      <div class="combined-course-group__text">
        <span class="combined-course-group__title">{{@item.title}}</span>
        {{#if @isCurrent}}
          {{#if @item.hasReliableActivitiesCount}}
            <span class="combined-course-group__progress">{{t
                "pages.combined-courses.items.group.progress"
                done=@item.completedActivitiesCount
                total=@item.activities.length
              }}</span>
          {{/if}}
        {{else}}
          <Composition @activities={{@item.activities}} />
        {{/if}}
      </div>
      {{#if @item.isCompleted}}
        <span class="combined-course-group__state">{{t "pages.combined-courses.items.completed"}}
          <PixIcon @name="checkCircle" @plainIcon={{true}} @ariaHidden={{true}} />
        </span>
      {{else if @item.isLocked}}
        <span class="combined-course-group__state combined-course-group__state--locked">
          <PixIcon @name="lock" @plainIcon={{true}} @ariaLabel={{t "pages.combined-courses.items.group.locked"}} />
        </span>
      {{else}}
        <PixTag @color="tertiary" class="combined-course-group__tag">{{t
            "pages.combined-courses.items.tagText"
          }}</PixTag>
      {{/if}}
    </div>

    {{#if @isCurrent}}
      <div class="combined-course-group__activities">
        {{#each @item.activities as |activity|}}
          <CombinedCourseItem
            @item={{activity}}
            @isLocked={{activity.isLocked}}
            @isNextItemToComplete={{false}}
            @actionLabel={{if
              (eq @item.nextActivity activity)
              (if
                activity.isStarted
                (t "pages.combined-courses.items.group.resume")
                (t "pages.combined-courses.items.group.start")
              )
            }}
            @onClick={{noop}}
            @isCombinedCourseCompleted={{false}}
          />
        {{/each}}
      </div>
    {{/if}}
  </div>
</template>

function noop() {}
