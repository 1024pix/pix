import PixCard from '@1024pix/pix-ui/components/pix-card';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { concat, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';

export const TARGET_PROFILE_OVERVIEW = 'target-profile-overview';
export const TARGET_PROFILE = 'targetProfile';
export const BLUEPRINT = 'blueprint';
export const COMBINED_COURSE_BLUEPRINT_OVERVIEW = 'combined-course-blueprint-overview';

export function getCourseInfo(courseType) {
  switch (courseType) {
    case TARGET_PROFILE:
    case TARGET_PROFILE_OVERVIEW:
      return {
        color: 'blue',
        label: 'pages.catalogue.card.tag.target-profile',
        image: 'https://assets.pix.org/sites/orga/target-profile.png',
      };
    case BLUEPRINT:
    case COMBINED_COURSE_BLUEPRINT_OVERVIEW:
      return {
        color: 'yellow',
        label: 'pages.catalogue.card.tag.blueprint',
        image: 'https://assets.pix.org/sites/orga/combined-course.png',
      };
    default:
      return null;
  }
}

export default class CourseCard extends Component {
  get courseInfo() {
    return getCourseInfo(this.args.course.type);
  }

  <template>
    <div class="course-card">
      <PixCard
        @variant="orga"
        @title={{@course.name}}
        @subtitle={{if @course.category (t (concat "pages.campaign-creation.tags." @course.category))}}
        @image={{this.courseInfo.image}}
        class="course-card"
      >
        <:tag>
          <PixTag @color={{this.courseInfo.color}} class="course-card__tag">{{t this.courseInfo.label}}</PixTag>
        </:tag>
        <:footer>
          {{#if (eq @course.type "targetProfile")}}
            {{t "pages.catalogue.card.tubes-count" count=@course.nbTubes}}
          {{else}}
            {{t "pages.catalogue.card.modules-count" count=@course.nbModules}}
          {{/if}}
          {{#if @course.isSimplifiedAccess}}
            <p class="course-card__footer">{{t "pages.catalogue.card.simplified-access"}}</p>
          {{/if}}
        </:footer>
      </PixCard>

      {{#if (eq @course.type "targetProfile")}}
        <LinkTo
          @route="authenticated.catalogue.list"
          @model={{@type}}
          @query={{hash targetProfileId=@course.id}}
          {{on "click" @selectCourse}}
          aria-label={{t "pages.catalogue.modal.open-modal" name=@course.name}}
        />
      {{else if (eq @course.type "blueprint")}}
        <LinkTo
          @route="authenticated.catalogue.list"
          @model={{@type}}
          @query={{hash blueprintId=@course.id}}
          {{on "click" @selectCourse}}
          aria-label={{t "pages.catalogue.modal.open-modal" name=@course.name}}
        />
      {{/if}}
    </div>
  </template>
}
