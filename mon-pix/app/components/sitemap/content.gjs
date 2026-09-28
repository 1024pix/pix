import { PixIcon } from '@1024pix/nebulix-ember';
import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class Content extends Component {
  <template>
    <main id="main" class="sitemap" role="main">
      <div class="sitemap__content">
        <h1 class="sitemap-content__title">{{t "pages.sitemap.title"}}</h1>

        <ul class="sitemap-content__items">
          <li class="sitemap-content-items__link">
            <h2>
              <LinkTo @route="authenticated.user-dashboard">
                {{t "navigation.main.dashboard"}}
              </LinkTo>
            </h2>
          </li>

          <li class="sitemap-content-items__link">
            <h2>
              <LinkTo @route="authenticated.profile">{{t "navigation.main.skills"}}</LinkTo>
            </h2>
            <ul class="sitemap-content-items-link-skills">
              {{#each @model.scorecards as |scorecard|}}
                <li class="sitemap-content-items-link-skills__skill">
                  <LinkTo @route="authenticated.competences.details" @model={{scorecard.competenceId}}>
                    {{scorecard.name}}
                  </LinkTo>
                </li>
              {{/each}}
            </ul>
          </li>

          <li class="sitemap-content-items__link">
            <h2>
              <LinkTo @route="authenticated.certifications">
                {{t "navigation.main.start-certification"}}
              </LinkTo>
            </h2>
          </li>

          <li class="sitemap-content-items__link">
            <h2>
              <LinkTo @route="authenticated.user-tutorials">
                {{t "navigation.main.tutorials"}}
              </LinkTo>
            </h2>
          </li>

          <li class="sitemap-content-items__link">
            <h2>
              <LinkTo @route="authenticated.user-trainings">
                {{t "navigation.main.trainings"}}
              </LinkTo>
            </h2>
          </li>

          <li class="sitemap-content-items__link">
            <h2>
              <LinkTo @route="fill-in-campaign-code">
                {{t "navigation.main.code"}}
              </LinkTo>
            </h2>
          </li>

          <li class="sitemap-content-items__link">
            <h2>
              <LinkTo @route="authenticated.user-account">
                {{t "navigation.user.account"}}
              </LinkTo>
            </h2>
          </li>

          <li class="sitemap-content-items__link">
            <h2>
              <LinkTo @route="authenticated.user-tests">
                {{t "navigation.user.tests"}}
              </LinkTo>
            </h2>
          </li>

          <li class="sitemap-content-items__link">
            <h2>
              <LinkTo @route="authenticated.user-certifications">
                {{t "navigation.user.certifications"}}
              </LinkTo>
            </h2>
          </li>

          <li class="sitemap-content-items__link">
            <h2>
              <a href="{{this.supportHomeUrl}}" target="_blank" rel="noopener noreferrer">
                {{t "navigation.main.help"}}
                <PixIcon @name="openNew" @ariaHidden={{true}} />
                <span class="sr-only">{{t "navigation.external-link-title"}}</span>
              </a>
            </h2>
          </li>

          <li class="sitemap-content-items__link sitemap-items__link--title">
            <h2>{{t "pages.sitemap.resources"}}</h2>
            <ul class="sitemap-content-items-link__resources">
              <li class="sitemap-content-items-link-resources__resource">
                <a href={{this.accessibilityUrl}} target="_blank" rel="noopener noreferrer">
                  {{t "pages.sitemap.accessibility.title"}}
                  <PixIcon @name="openNew" @ariaHidden={{true}} />
                  <span class="sr-only">{{t "navigation.external-link-title"}}</span>
                </a>
              </li>
              <li class="sitemap-content-items-link-resources__resource">
                <a href={{this.cguUrl}} target="_blank" rel="noopener noreferrer">
                  {{t "navigation.footer.eula"}}
                  <PixIcon @name="openNew" @ariaHidden={{true}} />
                  <span class="sr-only">{{t "navigation.external-link-title"}}</span>
                </a>
              </li>
              <li class="sitemap-content-items-link-resources__resource">
                <a href={{this.dataProtectionPolicyUrl}} target="_blank" rel="noopener noreferrer">
                  {{t "pages.sitemap.cgu.policy"}}
                  <PixIcon @name="openNew" @ariaHidden={{true}} />
                  <span class="sr-only">{{t "navigation.external-link-title"}}</span>
                </a>
              </li>
              <li class="sitemap-content-items-link-resources__resource">
                <a href={{this.dataProtectionPolicyUrl}} target="_blank" rel="noopener noreferrer">
                  {{t "pages.sitemap.cgu.subcontractors"}}
                  <PixIcon @name="openNew" @ariaHidden={{true}} />
                  <span class="sr-only">{{t "navigation.external-link-title"}}</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </main>
  </template>
  @service url;
  @service intl;
  @service currentDomain;

  get cguUrl() {
    return this.url.cguUrl;
  }

  get dataProtectionPolicyUrl() {
    return this.url.dataProtectionPolicyUrl;
  }

  get accessibilityUrl() {
    return this.url.accessibilityUrl;
  }

  get accessibilityHelpUrl() {
    return this.url.accessibilityHelpUrl;
  }

  get supportHomeUrl() {
    return this.url.supportHomeUrl;
  }
}
