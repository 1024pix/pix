import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class CampaignType extends Component {
  @service intl;

  get picto() {
    const { campaignType } = this.args;
    return campaignType === 'ASSESSMENT' ? 'speed' : 'profileShare';
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
      <PixIcon
        class={{this.pictoCssClass}}
        @name={{this.picto}}
        aria-hidden="{{this.pictoAriaHidden}}"
        aria-label={{this.pictoTitle}}
        ...attributes
      />
      {{#unless @hideLabel}}
        <span class="campaign-type__label">{{this.label}}</span>
      {{/unless}}
    </span>
  </template>
}
