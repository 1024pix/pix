import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import FooterLinks from '../footer/footer-links';
import LanguageSwitcher from '../language-switcher';

export default class Footer extends Component {
  @service currentDomain;
  @service intl;
  @service locale;
  @service router;

  get isInternationalDomain() {
    return !this.currentDomain.isFranceDomain;
  }

  get selectedLanguage() {
    return this.intl.primaryLocale;
  }

  @action
  onLanguageChange(language) {
    this.locale.setLocale(language);
    this.router.replaceWith({ queryParams: { lang: null } });
  }

  <template>
    <footer class="authentication-layout-footer" role="contentinfo">
      {{#if this.isInternationalDomain}}
        <LanguageSwitcher @selectedLanguage={{this.selectedLanguage}} @onLanguageChange={{this.onLanguageChange}} />
      {{/if}}
      <FooterLinks />
    </footer>
  </template>
}
