import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class Footer extends Component {
  @service intl;
  @service url;

  get currentYear() {
    const currentYear = new Date().getFullYear();
    return this.intl.t('navigation.footer.current-year', { currentYear });
  }

  get legalNoticeUrl() {
    return this.url.legalNoticeUrl;
  }

  get accessibilityUrl() {
    return this.url.accessibilityUrl;
  }

  <template>
    <footer class='footer'>
      <nav class='footer__navigation'>
        <ul class='footer__navigation-list'>
          <li>
            <a href={{this.legalNoticeUrl}} target='_blank' class='footer-navigation__item' rel='noopener noreferrer'>
              {{t 'navigation.footer.legal-notice'}}
            </a>
          </li>

          <li>
            <a href={{this.accessibilityUrl}} target='_blank' class='footer-navigation__item' rel='noopener noreferrer'>
              {{t 'navigation.footer.a11y'}}
            </a>
          </li>
        </ul>
      </nav>

      <div class='footer__copyright'>
        <span>{{this.currentYear}}</span>
      </div>
    </footer>
  </template>
}
