import { PixButton, PixIcon, PixModal } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { pageTitle } from 'ember-page-title';
import ResponsiveListWideWrap from 'mon-pix/components/common/responsive-ul-wide-wrap';
import ModuleObjectives from 'mon-pix/components/module/instruction/objectives';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';

export default class ModulixDetails extends Component {
  @service router;
  @service pixMetrics;
  @service media;
  @service intl;

  @tracked isSmallScreenModalOpen = false;

  get shouldDisplaySmallScreenModal() {
    return this.args.module.details.tabletSupport !== 'comfortable' && !this.media.isDesktop;
  }

  @action
  onModuleStart() {
    this.pixMetrics.trackEvent(`Clic sur le bouton Commencer un passage`, {
      category: 'Modulix',
      moduleId: this.args.module.id,
    });

    this.router.transitionTo('module.passage');
  }

  @action
  onModuleStartUsingSmallScreen() {
    this.pixMetrics.trackEvent(`Clic sur le bouton Commencer un passage en petit écran`, {
      category: 'Modulix',
      moduleId: this.args.module.id,
    });
    this.router.transitionTo('module.passage');
  }

  @action
  onSmallScreenModalOpen() {
    this.pixMetrics.trackEvent(`Ouvre la modale d'alerte de largeur d'écran`, {
      category: 'Modulix',
      moduleId: this.args.module.id,
    });
    this.isSmallScreenModalOpen = true;
  }

  @action
  onSmallScreenModalClose() {
    this.pixMetrics.trackEvent(`Ferme la modale d'alerte de largeur d'écran`, {
      category: 'Modulix',
      moduleId: this.args.module.id,
    });
    this.isSmallScreenModalOpen = false;
  }

  get moduleLevel() {
    return this.intl.t(`pages.modulix.details.levels.${this.args.module.details.level}`);
  }

  <template>
    {{pageTitle @module.title}}

    <main id="main" class="module-details" role="main">

      <div class="module-details__content">
        <div class="module-details__content__image">
          <img alt="" class="module-details-image__illustration" src={{@module.details.image}} height="150" />
        </div>

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
              <PixIcon
                @name="stopwatch"
                class="module-details-infos-indications-category-title__icon"
                @ariaHidden={{true}}
              />{{t "pages.modulix.details.duration"}}
            </div>
            <p>{{t "pages.modulix.details.durationValue" htmlSafe=true duration=@module.details.duration}}</p>
          </div>
          <div class="module-details-infos-indications__category">
            <div class="module-details-infos-indications-category__title">
              <PixIcon
                @name="barsUp"
                class="module-details-infos-indications-category-title__icon"
                @ariaHidden={{true}}
              />{{t "pages.modulix.details.level"}}
            </div>
            <p>{{this.moduleLevel}}</p>
          </div>
        </div>

        <div class="module-details-infos__objectives">
          <h2 class="module-details-infos-objectives__title">{{t "pages.modulix.details.objectives"}}</h2>
          <ModuleObjectives @objectives={{@module.details.objectives}} />
        </div>
      </div>
    </main>
  </template>
}
