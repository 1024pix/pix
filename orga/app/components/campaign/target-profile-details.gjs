import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import SafeMarkdownToHtml from '../safe-markdown-to-html';

export default class CampaignTargetProfileDetails extends Component {
  get displayResultInfo() {
    return this.args.hasStages
      ? {
          icon: 'star',
          label: 'common.target-profile-details.results.star',
        }
      : {
          icon: 'percent',
          label: 'common.target-profile-details.results.percent',
        };
  }

  <template>
    <span class="target-profile-details" ...attributes>
      {{#if @targetProfileDescription}}
        <SafeMarkdownToHtml class="target-profile-details__description" @markdown={{@targetProfileDescription}} />
      {{/if}}
      <ul class="target-profile-details__specificity">
        <li class="target-profile-details__specificity__row">
          <PixIcon @name="book" />
          {{t "common.target-profile-details.subjects" value=@targetProfileTubesCount}}
        </li>
        {{#if @hasBadges}}
          <li class="target-profile-details__specificity__row target-profile-details__specificity__row--add-separator">
            <PixIcon @name="awards" />
            {{t "common.target-profile-details.thematic-results" value=@targetProfileThematicResultCount}}
          </li>
        {{/if}}
        <li class="target-profile-details__specificity__row target-profile-details__specificity__row--break-line">
          <span class="target-profile-details__specificity__white-space">
            {{t "common.target-profile-details.results.common"}}
          </span>
          <PixIcon
            @aria-hidden={{false}}
            aria-label={{t this.displayResultInfo.label}}
            @name={{this.displayResultInfo.icon}}
          />
        </li>
      </ul>
    </span>
  </template>
}
