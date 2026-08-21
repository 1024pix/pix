import { PixIcon } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class CampaignType extends Component {
  @service intl;

  get iconConfig() {
    const { campaignType } = this.args;
    switch (campaignType) {
      case 'ASSESSMENT':
        return { icon: 'speed', class: 'campaign-type__icon--assessment' };
      case 'PROFILES_COLLECTION':
        return { icon: 'profileShare', class: 'campaign-type__icon--profile-collection' };
      case 'EXAM':
        return { icon: 'school', class: 'campaign-type__icon--exam' };
      default:
        return { icon: 'close', class: '' };
    }
  }

  get pictoCssClass() {
    const classes = ['campaign-type__icon'];

    classes.push(this.iconConfig.class);

    if (this.args.big) {
      classes.push(classes[0] + '--big');
    }
    return classes.join(' ');
  }

  get pictoAriaHidden() {
    return !this.args.hideLabel;
  }

  get pictoTitle() {
    return this.args.hideLabel ? this.label : null;
  }

  get label() {
    const informationLabels = {
      ASSESSMENT: 'components.campaign.type.information.ASSESSMENT',
      PROFILES_COLLECTION: 'components.campaign.type.information.PROFILES_COLLECTION',
      EXAM: 'components.campaign.type.information.EXAM',
    };

    const explanationLabels = {
      ASSESSMENT: 'components.campaign.type.explanation.ASSESSMENT',
      PROFILES_COLLECTION: 'components.campaign.type.explanation.PROFILES_COLLECTION',
      EXAM: 'components.campaign.type.explanation.EXAM',
    };

    const { campaignType, displayInformationLabel } = this.args;

    return this.intl.t(displayInformationLabel ? informationLabels[campaignType] : explanationLabels[campaignType]);
  }

  <template>
    <span class="campaign-type">
      <PixIcon
        class={{this.pictoCssClass}}
        @name={{this.iconConfig.icon}}
        @ariaHidden={{this.pictoAriaHidden}}
        @title={{this.pictoTitle}}
        ...attributes
      />
      {{#unless @hideLabel}}
        <span class="campaign-type__label">{{this.label}}</span>
      {{/unless}}
    </span>
  </template>
}
