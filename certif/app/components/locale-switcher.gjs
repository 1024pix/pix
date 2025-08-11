// This file is a COPY of an original file from mon-pix.
// If you need a change, as much as possible modify the original file
// and propagate the changes in the copies in all the fronts

import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';

export default class LocaleSwitcher extends Component {
  @service locale;
  @service router;

  @tracked selectedLocale;

  constructor() {
    super(...arguments);
    this.selectedLocale = this.args.defaultValue || this.locale.currentLanguage;
  }

  @action
  onChange(value) {
    this.selectedLocale = value;
    this.locale.setCurrentLocale(value);

    this.router.replaceWith({ queryParams: { lang: null } });

    if (this.args.onChange) {
      this.args.onChange(value);
    }
  }

  <template>
    <PixSelect
      ...attributes
      class='locale-switcher'
      @id='locale-switcher'
      @iconName='globe'
      @value={{this.selectedLocale}}
      @options={{this.locale.switcherDisplayedLanguages}}
      @onChange={{this.onChange}}
      @hideDefaultOption='true'
      @screenReaderOnly='true'
    >
      <:label>{{t 'components.locale-switcher.label'}}</:label>
    </PixSelect>
  </template>
}
