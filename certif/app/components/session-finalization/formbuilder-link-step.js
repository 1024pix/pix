import Component from '@glimmer/component';
import config from 'pix-certif/config/environment';

export default class FormbuilderLinkStep extends Component {
  formBuilderLinkUrl = config.formBuilderLinkUrl;

  get linkTo() {
    return this.formBuilderLinkUrl;
  }
}
