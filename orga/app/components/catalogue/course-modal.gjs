import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixOverlay from '@1024pix/pix-ui/components/pix-overlay';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { service } from '@ember/service';
import { recordIdentifierFor } from '@ember-data/store';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { eq, gt } from 'ember-truth-helpers';

import Badges from '../campaign/badges';
import { COMBINED_COURSE_BLUEPRINT, getCourseInfo, TARGET_PROFILE_OVERVIEW } from './course-card.gjs';
import TargetProfileContent from './course-modal/target-profile-content.gjs';

export default class CourseModal extends Component {
  @service currentUser;

  get courseTypeInfo() {
    return getCourseInfo(this.courseType);
  }

  get courseType() {
    return recordIdentifierFor(this.args.currentCourse).type;
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

  <template>
    <PixOverlay
      @isVisible={{@isModalOpen}}
      @onClose={{@closeModal}}
      @focusOnClose={{@focusOnClose}}
      @hasCenteredContent={{true}}
    >
      <div
        class="course-modal"
        role="dialog"
        aria-labelledby="modal-title--{{this.id}}"
        aria-describedby="modal-content--{{this.id}}"
        aria-modal="true"
      >
        <div class="course-modal__course-content">
          {{#if (eq this.courseType TARGET_PROFILE_OVERVIEW)}}
            <TargetProfileContent @currentCourse={{@currentCourse}} />
          {{else if (eq this.courseType COMBINED_COURSE_BLUEPRINT)}}
            {{! TODO BlueprintContent Component }}
          {{/if}}
        </div>
        <div class="course-modal__course-details">
          <div class="course-modal__header">
            <PixButton
              @variant="tertiary"
              @triggerAction={{@closeModal}}
              @size="small"
              @iconAfter="close"
              class="course-modal__exit"
            >
              {{t "common.actions.exit"}}
            </PixButton>
          </div>
          <div class="course-modal__body">
            <div class="pix-card__image pix-card__image--orga">
              <img src={{this.courseTypeInfo.image}} aria-hidden="true" alt={{@currentCourse.type}} />
            </div>
            <PixTag @color={{this.courseTypeInfo.color}} class="course-card__tag">
              {{t this.courseTypeInfo.label}}
            </PixTag>
            <h1 id="modal-title--{{this.id}}" class="course-modal__body__name">{{@currentCourse.name}}</h1>
            <p
              id="modal-content--{{this.id}}"
              class="course-modal__body__description"
            >{{@currentCourse.description}}</p>

            {{#if (gt @currentCourse.badges.length 0)}}
              <h2 class="course-modal__body__badges-title">
                {{t "pages.catalogue.modal.associated-badges"}}
              </h2>
              <div class="course-modal__body__badges">
                <Badges @badges={{@currentCourse.badges}} @hideBadgesAcquisition={{true}} />
              </div>
            {{/if}}

            <PixButtonLink
              @route={{this.campaignCreationRoute}}
              @isDisabled={{this.hasReachedPlacesLimit}}
              @size="small"
              class="course-modal__body__form-link"
            >
              {{t "pages.catalogue.modal.select-course"}}
            </PixButtonLink>
          </div>
          <div class="course-modal__footer">
            <p class="course-modal__footer__text">
              {{t this.courseLevelLabel}}
              &nbsp;•&nbsp;
              {{#if @currentCourse.isSimplifiedAccess}}
                {{t "common.target-profile-details.simplified-access.without-account"}}
              {{else}}
                {{t "common.target-profile-details.simplified-access.with-account"}}
              {{/if}}
            </p>
          </div>
        </div>
      </div>
    </PixOverlay>
  </template>
}
