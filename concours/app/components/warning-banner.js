import Component from '@ember/component';
import classic from 'ember-classic-decorator';
import ENV from 'mon-pix/config/environment';

@classic
export default class WarningBanner extends Component {
  isEnabled = ENV.APP.IS_WARNING_BANNER_ENABLED;
}
