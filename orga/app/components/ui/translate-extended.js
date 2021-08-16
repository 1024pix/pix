import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

/* this component allow us to translate sentences with Ember component wrapped in it.
`key` is the key for translation and `options` is an object with variables for translation.
Ember component are passed in variables with the `component` helper used in hbs file. */
export default class TranslateExtendedComponent extends Component {
  @service intl;

  get tokens() {
    return this.intl.t(this.args.key, this.args.options);
  }
}
