import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import { action } from '@ember/object';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { pageTitle } from 'ember-page-title';
import ResponsiveListWideWrap from 'mon-pix/components/common/responsive-ul-wide-wrap';
import ModuleObjectives from 'mon-pix/components/module/objectives';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';

export default class ModulixDetails extends Component {
  @service router;
  @service metrics;
  @service media;

  @tracked isSmallScreenModalOpen = false;

  get shouldDisplaySmallScreenModal() {
    return this.args.module.details.tabletSupport !== 'comfortable' && !this.media.isDesktop;
  }

  @action
  onModuleStart() {
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Détails du module : ${this.args.module.id}`,
      'pix-event-name': `Click sur le bouton Commencer un passage`,
    });
    this.router.transitionTo('module.passage', this.args.module.id);
  }

  @action
  onModuleStartUsingSmallScreen() {
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Détails du module : ${this.args.module.id}`,
      'pix-event-name': `Click sur le bouton Commencer un passage en petit écran`,
    });
    this.router.transitionTo('module.passage', this.args.module.id);
  }

  @action
  onSmallScreenModalOpen() {
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Détails du module : ${this.args.module.id}`,
      'pix-event-name': `Ouvre la modale d'alerte de largeur d'écran`,
    });
    this.isSmallScreenModalOpen = true;
  }

  @action
  onSmallScreenModalClose() {
    this.metrics.add({
      event: 'custom-event',
      'pix-event-category': 'Modulix',
      'pix-event-action': `Détails du module : ${this.args.module.id}`,
      'pix-event-name': `Ferme la modale d'alerte de largeur d'écran`,
    });
    this.isSmallScreenModalOpen = false;
  }

  <template>
    {{pageTitle @module.title}}

    <main id="main" class="module-details" role="main">
      <div class="module-details__image">
        <img alt="" class="module-details-image__illustration" src={{@module.details.image}} height="150" />
      </div>

      <div class="module-details__content">
        <div class="module-details-content__layout">
          <h1 class="module-details-content-layout__title">{{@module.title}}</h1>

          <div class="module-details-content-layout__description">{{htmlUnsafe @module.details.description}}</div>

          <div class="module-details-content-layout__link">
            {{#if this.shouldDisplaySmallScreenModal}}
              <PixButton @triggerAction={{this.onSmallScreenModalOpen}} @size="large">
                {{t "pages.modulix.details.startModule"}}
              </PixButton>
            {{else}}
              <PixButton @triggerAction={{this.onModuleStart}} @size="large">
                {{t "pages.modulix.details.startModule"}}
              </PixButton>
            {{/if}}
          </div>

          {{#if this.shouldDisplaySmallScreenModal}}
            <PixModal
              @title={{t "pages.modulix.details.smallScreenModal.title"}}
              @showModal={{this.isSmallScreenModalOpen}}
              @onCloseButtonClick={{this.onSmallScreenModalClose}}
            >
              <:content>
                <p class="module-details-content-layout-small-screen-modal__title">
                  {{t "pages.modulix.details.smallScreenModal.description"}}
                </p>
              </:content>
              <:footer>
                <div class="module-details-content-layout-small-screen-modal__footer">
                  <ResponsiveListWideWrap>
                    <li>
                      <PixButton
                        class="module-details-content-layout-small-screen-modal-footer-actions-item__button"
                        @variant="secondary"
                        @triggerAction={{this.onSmallScreenModalClose}}
                      >
                        {{t "pages.modulix.details.smallScreenModal.cancel"}}
                      </PixButton>
                    </li>
                    <li>
                      <PixButton
                        class="module-details-content-layout-small-screen-modal-footer-actions-item__button"
                        @triggerAction={{this.onModuleStartUsingSmallScreen}}
                      >
                        {{t "pages.modulix.details.smallScreenModal.startModule"}}
                      </PixButton>
                    </li>
                  </ResponsiveListWideWrap>
                </div>
              </:footer>
            </PixModal>
          {{/if}}
        </div>
      </div>

      <div class="module-details__infos">
        <div class="module-details-infos__indications">
          <div class="module-details-infos-indications__category">
            <div class="module-details-infos-indications-category__title">
              <FaIcon @icon="stopwatch" class="module-details-infos-indications-category-title__icon" />{{t
                "pages.modulix.details.duration"
              }}
            </div>
            <p>{{t "pages.modulix.details.durationValue" htmlSafe=true duration=@module.details.duration}}</p>
          </div>
          <div class="module-details-infos-indications__category">
            <div class="module-details-infos-indications-category__title">
              <FaIcon @icon="signal" class="module-details-infos-indications-category-title__icon" />{{t
                "pages.modulix.details.level"
              }}
            </div>
            <p>{{@module.details.level}}</p>
          </div>
        </div>

        <div class="module-details-infos__objectives">
          <h2 class="module-details-infos-objectives__title">{{t "pages.modulix.details.objectives"}}</h2>
          <ModuleObjectives @objectives={{@module.details.objectives}} />
        </div>

        <div class="module-details-infos__explanation">
          <div class="module-details-infos-explanation__title">
            <h2>{{t "pages.modulix.details.explanationTitle"}}</h2>
          </div>
          <p class="module-details-infos-explanation__text">{{t "pages.modulix.details.explanationText1"}}</p>
          <p class="module-details-infos-explanation__text">{{t "pages.modulix.details.explanationText2"}}</p>
        </div>
      </div>
    </main>
  </template>
}
