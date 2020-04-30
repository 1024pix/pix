import { classNames } from '@ember-decorators/component';
import { computed } from '@ember/object';
import { filterBy } from '@ember/object/computed';
import _maxBy from 'lodash/maxBy';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

@classic
@classNames('resume-campaign-banner')
export default class ResumeCampaignBanner extends Component {
  campaignParticipations = [];

  @filterBy('campaignParticipations', 'isShared', false)
  unsharedCampaignParticipations;

  @computed('unsharedCampaignParticipations.@each.createdAt')
  get lastUnsharedCampaignParticipation() {
    return _maxBy(this.unsharedCampaignParticipations, 'createdAt');
  }

  @computed(
    'lastUnsharedCampaignParticipation.campaign.{title,code,isTypeAssessment},lastUnsharedCampaignParticipation.assessment.isCompleted'
  )
  get campaignParticipationState() {
    if (this.lastUnsharedCampaignParticipation) {
      return {
        title: this.lastUnsharedCampaignParticipation.campaign.get('title'),
        code: this.lastUnsharedCampaignParticipation.campaign.get('code'),
        isTypeAssessment: this.lastUnsharedCampaignParticipation.campaign.get('isTypeAssessment'),
        assessment: this.lastUnsharedCampaignParticipation.assessment
      };
    }

    return null;
  }
}
