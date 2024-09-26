import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class FooterLinks extends Component {
  @service url;
  @service currentDomain;

  get shouldDisplayStudentDataProtectionPolicyLink() {
    return this.currentDomain.isFranceDomain;
  }

  get cguUrl() {
    return this.url.cguUrl;
  }

  get legalNoticeUrl() {
    return this.url.legalNoticeUrl;
  }

  get dataProtectionPolicyUrl() {
    return this.url.dataProtectionPolicyUrl;
  }

  get accessibilityUrl() {
    return this.url.accessibilityUrl;
  }

  get supportHomeUrl() {
    return this.url.supportHomeUrl;
  }

  get serverStatusUrl() {
    return this.url.serverStatusUrl;
  }

  <template>
    <nav class="footer-container-content__navigation" role="navigation" aria-label={{t "navigation.footer.label"}}>
      <ul class="footer-container-content__navigation-list">
        <li>
          <a href="{{this.supportHomeUrl}}" target="_blank" class="footer-navigation__item" rel="noopener noreferrer">
            {{t "navigation.footer.help-center"}}
          </a>
        </li>

        <li>
          <a href="{{this.accessibilityUrl}}" target="_blank" class="footer-navigation__item" rel="noopener noreferrer">
            {{t "navigation.footer.a11y"}}
          </a>
        </li>

        <li>
          <a href="{{this.cguUrl}}" target="_blank" class="footer-navigation__item" rel="noopener noreferrer">
            {{t "navigation.footer.eula"}}
          </a>
        </li>

        <li>
          <a href="{{this.legalNoticeUrl}}" target="_blank" class="footer-navigation__item" rel="noopener noreferrer">
            {{t "navigation.footer.legal-notice"}}
          </a>
        </li>

        <li>
          <a
            href="{{this.dataProtectionPolicyUrl}}"
            target="_blank"
            class="footer-navigation__item"
            rel="noopener noreferrer"
          >
            {{t "navigation.footer.data-protection-policy"}}
          </a>
        </li>

        {{#if this.shouldDisplayStudentDataProtectionPolicyLink}}
          <li>
            <a
              href="{{t 'navigation.footer.student-data-protection-policy-url'}}"
              target="_blank"
              class="footer-navigation__item"
              rel="noopener noreferrer"
            >
              {{t "navigation.footer.student-data-protection-policy"}}
            </a>
          </li>
        {{/if}}
        <li>
          <a href="{{this.serverStatusUrl}}" target="_blank" class="footer-navigation__item" rel="noopener noreferrer">
            {{t "navigation.footer.server-status"}}
          </a>
        </li>
      </ul>
    </nav>
  </template>
}
