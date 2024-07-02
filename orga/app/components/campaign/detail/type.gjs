import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';

export default class CampaignType extends Component {
  @service intl;

  get picto() {
    const { campaignType } = this.args;
    return campaignType === 'ASSESSMENT' ? 'tachometer' : 'person-export';
  }

  get pictoCssClass() {
    const classes = [];
    const { campaignType } = this.args;
    classes.push(
      campaignType === 'ASSESSMENT' ? 'campaign-type__icon-assessment' : 'campaign-type__icon-profile-collection',
    );
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
    const { campaignType, labels } = this.args;

    return this.intl.t(labels[campaignType]);
  }

  <template>
    <span class="campaign-type">
      <FaIcon
        class="{{this.pictoCssClass}}"
        @icon="{{this.picto}}"
        @prefix="fapix"
        aria-hidden={{this.pictoAriaHidden}}
        @title={{this.pictoTitle}}
        ...attributes
      />
      {{#unless @hideLabel}}
        <span class="campaign-type__label">{{this.label}}</span>
      {{/unless}}
    </span>
  </template>
}
