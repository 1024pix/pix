import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixOverlay from '@1024pix/pix-ui/components/pix-overlay';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { recordIdentifierFor } from '@warp-drive/core';
import { t } from 'ember-intl';
import { gt } from 'ember-truth-helpers';
import SafeMarkdownToHtml from 'pix-orga/components/safe-markdown-to-html';
import { EVENT_NAME } from 'pix-orga/helpers/metrics-event-name';

import Badges from '../campaign/badges';
import { COMBINED_COURSE_BLUEPRINT_OVERVIEW, getCourseInfo, TARGET_PROFILE_OVERVIEW } from './course-card.gjs';
import CombinedCourseBlueprintContent from './course-modal/combined-course-blueprint-content.gjs';
import TargetProfileContent from './course-modal/target-profile-content.gjs';

export default class CourseModal extends Component {
  @service currentUser;
  @service pixMetrics;

  id = crypto.randomUUID();

  get courseInfo() {
    return getCourseInfo(this.courseType);
  }

  get courseType() {
    return recordIdentifierFor(this.args.currentCourse).type;
  }

  get isTargetProfile() {
    return this.courseType === TARGET_PROFILE_OVERVIEW;
  }

  get isCombinedCourseBlueprint() {
    return this.courseType === COMBINED_COURSE_BLUEPRINT_OVERVIEW;
  }

  get hasReachedPlacesLimit() {
    return this.currentUser.placeStatistics?.hasReachedMaximumPlacesLimit;
  }

  get campaignCreationRoute() {
    if (this.hasReachedPlacesLimit) {
      return null;
    }
    return 'authenticated.campaigns.new';
  }

  get courseLevelLabel() {
    if (this.args.currentCourse.level < 3) {
      return 'pages.statistics.level.novice';
    } else if (this.args.currentCourse.level < 5) {
      return 'pages.statistics.level.independent';
    } else if (this.args.currentCourse.level < 7) {
      return 'pages.statistics.level.advanced';
    } else {
      return 'pages.statistics.level.expert';
    }
  }

  get courseDescription() {
    if (this.isTargetProfile) return this.args.currentCourse.description;
    if (this.isCombinedCourseBlueprint) return this.args.currentCourse.prescriberDescription;
    return '';
  }

  @action
  trackCourseSelection() {
    this.pixMetrics.trackEvent(EVENT_NAME.CATALOGUE.COURSE_SELECTION_CLICK);
  }

  <template>
    <PixOverlay
      @isVisible={{@isModalOpen}}
      @onClose={{@closeModal}}
      @focusOnClose={{@focusOnClose}}
      @hasCenteredContent={{true}}
    >
      <div
        class="course-modal course-modal--{{this.courseInfo.type}}"
        role="dialog"
        aria-labelledby="modal-title--{{this.id}}"
        aria-describedby="modal-content--{{this.id}}"
        aria-modal="true"
      >
        <div class="course-modal__course-details">
          <div class="course-modal__heading">
            <PixTag @color={{this.courseInfo.color}}>
              {{t this.courseInfo.label}}
            </PixTag>
            <h1 id="modal-title--{{this.id}}" class="course-modal__heading__name">
              {{@currentCourse.name}}
            </h1>
          </div>

          <div class="course-modal__body">
            <SafeMarkdownToHtml
              id="modal-content--{{this.id}}"
              class="course-modal__body__description"
              @markdown={{this.courseDescription}}
            />
          </div>

          <div class="course-modal__footer">
            {{#if (gt @currentCourse.badges.length 0)}}
              <div class="course-modal__badges">
                <h2 class="course-modal__badges__title">
                  {{t "pages.catalogue.modal.associated-badges"}}
                </h2>
                <div class="course-modal__badges__container">
                  <Badges @badges={{@currentCourse.badges}} @hideBadgesAcquisition={{true}} />
                </div>
              </div>
            {{/if}}

            <PixButtonLink
              @route={{this.campaignCreationRoute}}
              @query={{hash courseId=@currentCourse.id}}
              @isDisabled={{this.hasReachedPlacesLimit}}
              @size="small"
              class="course-modal__form-link"
              {{on "click" this.trackCourseSelection}}
            >
              {{t "pages.catalogue.modal.select-course"}}
            </PixButtonLink>

            {{#if this.isTargetProfile}}
              <p class="course-modal__footer__text">
                {{t this.courseLevelLabel}}
                &nbsp;•&nbsp;
                {{#if @currentCourse.isSimplifiedAccess}}
                  {{t "common.target-profile-details.simplified-access.without-account"}}
                {{else}}
                  {{t "common.target-profile-details.simplified-access.with-account"}}
                {{/if}}
              </p>
            {{/if}}
          </div>
        </div>
        <div class="course-modal__course-content__wrapper">
          <div class="course-modal__course-content__title">
            {{#if this.isTargetProfile}}
              <h3 class="pix-title-xs">
                {{t "pages.catalogue.modal.target-profile-content.title"}}
              </h3>
            {{else if this.isCombinedCourseBlueprint}}
              <h3 class="pix-title-xs">
                {{t "pages.catalogue.modal.combined-course-content.title"}}
              </h3>
            {{/if}}

            <PixButton
              @variant="secondary"
              @triggerAction={{@closeModal}}
              @size="small"
              @iconAfter="close"
              class="course-modal__top-actions__exit"
            >
              {{t "common.actions.exit"}}
            </PixButton>
          </div>
          <div class="course-modal__course-content">
            {{#if this.isTargetProfile}}
              <TargetProfileContent @currentCourse={{@currentCourse}} />
            {{else if this.isCombinedCourseBlueprint}}
              <CombinedCourseBlueprintContent @combinedCourseBlueprint={{@currentCourse}} />
            {{/if}}
          </div>
        </div>
      </div>
    </PixOverlay>
  </template>
}
