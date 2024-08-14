import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { FRENCH_INTERNATIONAL_LOCALE } from 'pix-certif/services/locale';

export default class LanguageSwitcher extends Component {
  @service locale;

  get alphabeticallySortedLanguages() {
    const availableLanguages = this.locale.getAvailableLanguages();

    const options = Object.entries(availableLanguages)
      .filter(([_, config]) => config.languageSwitcherDisplayed)
      .map(([key, config]) => ({
        label: config.value,
        value: key,
      }));

    const optionsWithoutFrSortedByLabel = options
      .filter((option) => option.value !== FRENCH_INTERNATIONAL_LOCALE)
      .sort((option) => option.label);

    const frenchLanguageOption = options.find((option) => option.value === FRENCH_INTERNATIONAL_LOCALE);

    return [frenchLanguageOption, ...optionsWithoutFrSortedByLabel];
  }

  <template>
    <PixSelect
      @id='language-switcher'
      @icon='earth-europe'
      @value={{@selectedLanguage}}
      @options={{this.alphabeticallySortedLanguages}}
      @onChange={{@onLanguageChange}}
      @hideDefaultOption='true'
      @screenReaderOnly='true'
      ...attributes
    >
      <:label>{{t 'common.forms.login.choose-language-aria-label'}}</:label>
    </PixSelect>
  </template>
}
