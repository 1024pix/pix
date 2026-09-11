import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';
import CombinedCourseItem from 'mon-pix/components/combined-course/combined-course-item';
import { CombinedCourseItemTypes } from 'mon-pix/models/combined-course-item';

// What a group is made of, shown in its header. Built from the child's real activities,
// so it never announces something the API did not compute.
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

const Activities = <template>
  <div class="combined-course-group__activities" id={{@contentId}}>
    {{#each @item.activities as |activity|}}
      <CombinedCourseItem
        @item={{activity}}
        @isLocked={{activity.isLocked}}
        @isNextItemToComplete={{eq @item.nextActivity activity}}
        @actionLabel={{if
          (eq @item.nextActivity activity)
          (if
            activity.isStarted
            (t "pages.combined-courses.items.group.resume")
            (t "pages.combined-courses.items.group.start")
          )
        }}
        @onClick={{@onActivityClick}}
        @isCombinedCourseCompleted={{false}}
      />
    {{/each}}
  </div>
</template>;

// POC: a nested combined course is not a destination any more, it is a group in the
// parent's list. The current one stays open; a completed one can be unfolded to look
// back at its detail. PixAccordions always starts collapsed with no way to force it
// open, hence this local disclosure.
export default class NestedGroup extends Component {
  @tracked isUnfolded = false;

  contentId = `nested-group-${guidFor(this)}`;

  get isOpen() {
    return this.args.isCurrent || this.isUnfolded;
  }

  get isExpandable() {
    return !this.args.isCurrent && this.args.item.isCompleted;
  }

  @action
  toggle() {
    this.isUnfolded = !this.isUnfolded;
  }

  <template>
    <div
      class="combined-course-group
        {{if @isCurrent 'combined-course-group--current'}}
        {{if @item.isCompleted 'combined-course-group--completed'}}"
    >
      {{#if this.isExpandable}}
        <button
          type="button"
          class="combined-course-group__header combined-course-group__header--expandable"
          aria-expanded="{{if this.isOpen 'true' 'false'}}"
          aria-controls={{this.contentId}}
          {{on "click" this.toggle}}
        >
          <span class="combined-course-group__badge">
            <PixIcon @name="signpost" @plainIcon={{true}} @ariaHidden={{true}} />
          </span>
          <span class="combined-course-group__text">
            <span class="combined-course-group__title">{{@item.title}}</span>
            <Composition @activities={{@item.activities}} />
          </span>
          <span class="combined-course-group__state">{{t "pages.combined-courses.items.completed"}}
            <PixIcon @name="checkCircle" @plainIcon={{true}} @ariaHidden={{true}} />
          </span>
          <PixIcon
            class="combined-course-group__chevron"
            @name={{if this.isOpen "chevronTop" "chevronBottom"}}
            @ariaHidden={{true}}
          />
        </button>
      {{else}}
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
          {{#if @item.isLocked}}
            <span class="combined-course-group__state combined-course-group__state--locked">
              <PixIcon @name="lock" @plainIcon={{true}} @ariaLabel={{t "pages.combined-courses.items.group.locked"}} />
            </span>
          {{else}}
            <PixTag @color="tertiary" class="combined-course-group__tag">{{t
                "pages.combined-courses.items.tagText"
              }}</PixTag>
          {{/if}}
        </div>
      {{/if}}

      {{#if this.isOpen}}
        <Activities @item={{@item}} @onActivityClick={{@onActivityClick}} @contentId={{this.contentId}} />
      {{/if}}
    </div>
  </template>
}
