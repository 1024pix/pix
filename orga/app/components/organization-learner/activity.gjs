import PixIndicatorCard from '@1024pix/pix-ui/components/pix-indicator-card';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import EmptyState from './activity/empty-state';
import ParticipationList from './activity/participation-list';

export default class Activity extends Component {
  @tracked statistics = [];

  constructor() {
    super(...arguments);
    Promise.resolve(this.args.statistics).then((statistics) => {
      this.statistics = statistics;
    });
  }

  get assessmentStatistics() {
    return this.statistics.find((stat) => stat.id === 'ASSESSMENT');
  }

  get profileCollectionsStatistics() {
    return this.statistics.find((stat) => stat.id === 'PROFILES_COLLECTION');
  }

  <template>
    {{#if @participations}}
      <div class="cards">
        <div class="cards__content">
          <h2 class="screen-reader-only">{{t "pages.organization-learner.activity.assessment-summary"}}</h2>
          <PixIndicatorCard
            @title={{t "pages.organization-learner.activity.cards.title.assessment"}}
            @color="purple"
            @iconName="speed"
          >
            <:default>{{this.assessmentStatistics.total}}</:default>
            <:sub>
              <ul class="cards__stats">
                <li>{{t
                    "pages.organization-learner.activity.cards.started"
                    count=this.assessmentStatistics.started
                  }}</li>
                <li>{{t "pages.organization-learner.activity.cards.shared" count=this.assessmentStatistics.shared}}</li>
              </ul>
            </:sub>
          </PixIndicatorCard>
        </div>
        <div class="cards__content">
          <h2 class="screen-reader-only">{{t "pages.organization-learner.activity.profile-collection-summary"}}</h2>
          <PixIndicatorCard
            @title={{t "pages.organization-learner.activity.cards.title.profiles-collection"}}
            @color="blue"
            @iconName="profileShare"
          >
            <:default>{{this.profileCollectionsStatistics.total}}</:default>
            <:sub>
              <ul class="cards__stats">
                <li>
                  {{t
                    "pages.organization-learner.activity.cards.started"
                    count=this.profileCollectionsStatistics.started
                  }}
                </li>
                <li>
                  {{t
                    "pages.organization-learner.activity.cards.shared"
                    count=this.profileCollectionsStatistics.shared
                  }}
                </li>
              </ul>
            </:sub>
          </PixIndicatorCard>
        </div>
      </div>
      <h2 class="screen-reader-only">{{t "pages.organization-learner.activity.participations-title"}}</h2>
      <ParticipationList @participations={{@participations}} class="activity__participants-list" />
    {{else}}
      <EmptyState @firstName={{@learner.firstName}} @lastName={{@learner.lastName}} />
    {{/if}}
  </template>
}
