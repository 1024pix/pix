import Component from '@glimmer/component';
import ENV from 'mon-pix/config/environment';

export default class WarningBanner extends Component {
  isEnabled = ENV.APP.IS_STAGING_BANNER_ENABLED;
}
