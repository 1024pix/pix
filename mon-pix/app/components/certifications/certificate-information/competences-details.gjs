import { PixBlock, PixButtonLink } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq, gte } from 'ember-truth-helpers';

export default class CertificateCompetencesDetails extends Component {
  @service url;
  @service currentDomain;
  @service currentUser;

  @tracked activeTab = 0;

  @action
  handleTabChange(tabIndex) {
    this.activeTab = tabIndex;
  }

  @action
  handleTabNavigation(event) {
    const focusedTab = document.activeElement;
    const focusedTabIndex = Array.from(focusedTab.parentNode.children).indexOf(focusedTab);
    const tabsCount = this.args.certificate.resultCompetenceTree.get('areas').length;

    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight'
    ) {
      event.preventDefault();
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      if (focusedTabIndex + 1 < tabsCount) {
        focusedTab.parentNode.children[focusedTabIndex + 1].focus();
      } else {
        focusedTab.parentNode.children[0].focus();
      }
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      if (focusedTabIndex < 1) {
        focusedTab.parentNode.children[tabsCount - 1].focus();
      } else {
        focusedTab.parentNode.children[focusedTabIndex - 1].focus();
      }
    }
  }

  get isUserFrenchReader() {
    return this.currentUser.user && this.currentUser.user.lang === 'fr';
  }

  get displayCertificationResultsExplanation() {
    return this.args.certificate.isV3 && (this.currentDomain.isFranceDomain || this.isUserFrenchReader);
  }

  <template>
    <section class="certificate-competences-details">
      <h2 id="competences-list-title" class="certificate-competences-details__title">
        {{t "pages.certificate.details.competences.title"}}
      </h2>
      <p class="certificate-competences-details__description">
        {{t "pages.certificate.details.competences.description"}}
        {{#if this.displayCertificationResultsExplanation}}
          <PixButtonLink
            @href={{this.url.certificationResultsExplanationUrl}}
            target="_blank"
            rel="noopener noreferrer"
            @variant="tertiary"
            @iconAfter="openNew"
          >
            {{t "pages.certificate.learn-about-certification-results"}}
          </PixButtonLink>
        {{/if}}
      </p>

      <PixBlock class="certificate-competences-details__tabs" @variant="admin">
        <div class="certificate-competences-details__tablist" role="tablist" aria-labelledby="competences-list-title">
          {{#each @certificate.resultCompetenceTree.areas as |area index|}}
            <button
              id="area-tab-{{index}}"
              class="certificate-competences-details-tablist__tab"
              data-area-code={{area.code}}
              type="button"
              role="tab"
              aria-controls="area-{{index}}"
              aria-selected={{if (eq index this.activeTab) "true" ""}}
              tabindex={{if (eq index this.activeTab) 0 -1}}
              {{on "click" (fn this.handleTabChange index)}}
              {{on "keydown" this.handleTabNavigation}}
            >
              <span class="focus">{{area.title}}</span>
            </button>
          {{/each}}
        </div>
        <div>
          {{#each @certificate.resultCompetenceTree.areas as |area index|}}
            <div
              id="area-{{index}}"
              role="tabpanel"
              aria-labelledby="area-tab-{{index}}"
              hidden={{if (eq index this.activeTab) "" "true"}}
            >
              <div class="certificate-competences-details-tablist__area-header" data-area-code={{area.code}}>
                <h3>{{area.title}}</h3>
                <div role="presentation">{{t "common.level"}}</div>
              </div>
              <ol class="certificate-competences-details-tablist__competences-list">
                {{#each area.resultCompetences as |resultCompetence|}}
                  <li data-competence-index={{resultCompetence.index}}>
                    <span>{{resultCompetence.name}}</span>
                    {{#if (gte resultCompetence.level 0)}}
                      <span><small class="sr-only">{{t "common.level"}}</small>{{resultCompetence.level}}</span>
                    {{else}}
                      <span>-<small class="sr-only">{{t "common.no-level"}}</small></span>
                    {{/if}}
                  </li>
                {{/each}}
              </ol>
            </div>
          {{/each}}
        </div>
      </PixBlock>
    </section>
  </template>
}
