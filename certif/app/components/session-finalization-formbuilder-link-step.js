import Component from '@glimmer/component';
import config from '../config/environment';

export default class SessionFinalizationFormBuilderLinkStep extends Component {

  constructor() {
    super(...arguments);

    this.formBuilderLinkUrl = config.formBuilderLinkUrl;
  }
}
