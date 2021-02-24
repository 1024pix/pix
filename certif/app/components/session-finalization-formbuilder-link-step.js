import Component from '@glimmer/component';
import config from '../config/environment';

export default class SessionFinalizationFormBuilderLinkStep extends Component {
  formBuilderLinkUrl = config.formBuilderLinkUrl;

  get linkTo() {
    return this.formBuilderLinkUrl;
  }
}
