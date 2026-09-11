import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { LinkTo } from '@ember/routing';
import { t } from 'ember-intl';
import { and, eq, not, or } from 'ember-truth-helpers';

// POC: a nested combined course is not a destination any more, it is a group in the
// parent's list. Only the current group is expanded, and its activities are clicked
// straight from the parent page.
const Activity = <template>
  <div
    class="combined-course-group__activity
      {{if @activity.isCompleted 'combined-course-group__activity--completed'}}
      {{if @activity.isLocked 'combined-course-group__activity--locked'}}
      {{unless (or @activity.isCompleted @activity.isLocked) 'combined-course-group__activity--current'}}"
  >
    <div class="combined-course-group__activity-icon">
      {{#if @activity.image}}
        <img src={{@activity.image}} alt="" role="presentation" />
      {{else}}
        <PixIcon @name={{if (eq @activity.type "campaign") "distance" "acute"}} @ariaHidden={{true}} />
      {{/if}}
    </div>
    <div class="combined-course-group__activity-text">
      <span class="combined-course-group__activity-title">{{@activity.title}}</span>
      {{#if @activity.duration}}
        <span class="combined-course-group__activity-meta">{{t
            "pages.combined-courses.items.duration"
            duration=@activity.duration
          }}</span>
      {{/if}}
    </div>
    {{#if @activity.isCompleted}}
      <span class="combined-course-group__activity-state">{{t "pages.combined-courses.items.completed"}}
        <PixIcon @name="checkCircle" @plainIcon={{true}} @ariaHidden={{true}} />
      </span>
    {{else if @activity.isLocked}}
      <span class="combined-course-group__activity-state">
        <PixIcon @name="lock" @plainIcon={{true}} @ariaLabel={{t "pages.combined-courses.items.group.locked"}} />
      </span>
    {{/if}}
  </div>
</template>;

<template>
  <div
    class="combined-course-group
      {{if @isCurrent 'combined-course-group--current'}}
      {{if @item.isCompleted 'combined-course-group--completed'}}
      {{if @item.isLocked 'combined-course-group--locked'}}"
  >
    <div class="combined-course-group__header">
      <span class="combined-course-group__badge">
        <PixIcon @name="signpost" @plainIcon={{true}} @ariaHidden={{true}} />
      </span>
      <div class="combined-course-group__text">
        <span class="combined-course-group__title">{{@item.title}}</span>
        {{#if (and @isCurrent @item.hasReliableActivitiesCount)}}
          <span class="combined-course-group__progress">{{t
              "pages.combined-courses.items.group.progress"
              done=@item.completedActivitiesCount
              total=@item.activities.length
            }}</span>
        {{/if}}
      </div>
      {{#if @item.isCompleted}}
        <span class="combined-course-group__state">{{t "pages.combined-courses.items.completed"}}
          <PixIcon @name="checkCircle" @plainIcon={{true}} @ariaHidden={{true}} />
        </span>
      {{else if @item.isLocked}}
        <span class="combined-course-group__state">
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
          {{#if (and (not activity.isLocked) (not activity.isPlaceholder))}}
            <LinkTo @route={{activity.route}} @models={{activity.models}} @query={{activity.query}}>
              <Activity @activity={{activity}} />
            </LinkTo>
          {{else}}
            <Activity @activity={{activity}} />
          {{/if}}
        {{/each}}
      </div>
    {{/if}}
  </div>
</template>
