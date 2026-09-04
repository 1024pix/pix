import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { modifier } from 'ember-modifier';
import onIntersect from 'mon-pix/modifiers/on-intersect';

import TrainingCard from './training/card';

export const TRAININGS_LIST_ID = 'results-recommendation-engine-training-list';
const TRAININGS_PER_PAGE = 3;

export default class Trainings extends Component {
  @service intl;

  @tracked currentPageFirstCardIndex = 0;
  @tracked spacerWidth = null;

  titleId = `results-recommendation-engine-training-title-${guidFor(this)}`;

  list = null;

  registerList = modifier((element) => {
    this.list = element;
    this.updateSpacerWidth();

    const resizeObserver = new ResizeObserver(this.resyncScrollPosition);
    resizeObserver.observe(element, { box: 'content-box' });

    return () => {
      resizeObserver.disconnect();
    };
  });

  get areNavigationButtonsVisible() {
    return this.args.trainings.length > TRAININGS_PER_PAGE;
  }

  get cards() {
    return this.list.children;
  }

  get spacerStyle() {
    return this.spacerWidth === null ? null : htmlSafe(`width: ${this.spacerWidth}px`);
  }

  get isPreviousButtonDisabled() {
    return this.currentPageFirstCardIndex === 0;
  }

  get isNextButtonDisabled() {
    return this.currentPageFirstCardIndex + TRAININGS_PER_PAGE >= this.args.trainings.length;
  }

  get paginationAnnouncement() {
    const total = this.args.trainings.length;
    const from = this.currentPageFirstCardIndex + 1;
    const to = Math.min(this.currentPageFirstCardIndex + TRAININGS_PER_PAGE, total);

    return this.intl.t('pages.skill-review.recommended-engine.trainings.pagination-announcement', {
      from,
      to,
      total,
    });
  }

  @action
  slideAriaLabel(index) {
    return this.intl.t('pages.skill-review.recommended-engine.trainings.slide-aria-label', {
      position: index + 1,
      total: this.args.trainings.length,
    });
  }

  get scrollBehavior() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  }

  @action
  scrollToPreviousTrainings() {
    this.args.onNavigationButtonClick('previous');
    this.goToCardIndex(Math.max(this.currentPageFirstCardIndex - TRAININGS_PER_PAGE, 0));
  }

  @action
  scrollToNextTrainings() {
    this.args.onNavigationButtonClick('next');
    this.goToCardIndex(Math.min(this.currentPageFirstCardIndex + TRAININGS_PER_PAGE, this.args.trainings.length - 1));
  }

  @action
  resyncScrollPosition() {
    if (!this.areNavigationButtonsVisible) return;

    this.updateSpacerWidth();
    this.goToCardIndex(this.currentPageFirstCardIndex, 'instant');
  }

  goToCardIndex(index, behavior = this.scrollBehavior) {
    this.currentPageFirstCardIndex = index;
    const targetCard = this.cards[index];
    this.list.scrollTo({ left: targetCard.offsetLeft, behavior });
  }

  // The list can show more than TRAININGS_PER_PAGE cards at once (a peek of
  // the next card is visible by design). The trailing spacer must cover that
  // extra peeked width, otherwise the browser clamps scrollTo() short of the
  // last card's offsetLeft and a previous card re-appears on the left.
  //
  // Only needed while scrolling is JS-driven (list--hidden sets
  // overflow-x: hidden at the desktop breakpoint, see trainings.scss). Below
  // that breakpoint, scrolling is native and this spacer stays at its CSS
  // default. Reading the computed overflow-x instead of duplicating the
  // breakpoint value keeps the SCSS as the single source of truth.
  updateSpacerWidth() {
    if (!this.areNavigationButtonsVisible || getComputedStyle(this.list).overflowX !== 'hidden') {
      this.spacerWidth = null;
      return;
    }

    const [firstCard] = this.cards;
    this.spacerWidth = Math.max(0, this.list.clientWidth - firstCard.offsetWidth);
  }

  <template>
    <section
      id={{TRAININGS_LIST_ID}}
      tabindex="-1"
      class="results-recommendation-engine-training"
      aria-labelledby={{this.titleId}}
      aria-roledescription={{t "pages.skill-review.recommended-engine.trainings.carousel-roledescription"}}
      {{onIntersect @onFullyVisible threshold=1}}
    >
      <div class="results-recommendation-engine-training__header">
        <div>
          <h2 id={{this.titleId}} class="results-recommendation-engine-training__title">{{t
              "pages.skill-review.recommended-engine.trainings.title"
            }}</h2>
          <p class="results-recommendation-engine-training__description">{{t
              "pages.skill-review.recommended-engine.trainings.description"
            }}</p>
        </div>

        {{#if this.areNavigationButtonsVisible}}
          <div class="results-recommendation-engine-training__navigation">
            <PixIconButton
              @ariaLabel={{t "pages.skill-review.recommended-engine.trainings.previous-button-aria-label"}}
              @iconName="chevronLeft"
              @isDisabled={{this.isPreviousButtonDisabled}}
              @triggerAction={{this.scrollToPreviousTrainings}}
            />
            <PixIconButton
              @ariaLabel={{t "pages.skill-review.recommended-engine.trainings.next-button-aria-label"}}
              @iconName="chevronRight"
              @isDisabled={{this.isNextButtonDisabled}}
              @triggerAction={{this.scrollToNextTrainings}}
            />
          </div>
          <p class="sr-only" aria-live="polite">{{this.paginationAnnouncement}}</p>
        {{/if}}
      </div>

      <ul
        class="results-recommendation-engine-training__list
          {{if this.areNavigationButtonsVisible 'results-recommendation-engine-training__list--hidden'}}"
        {{this.registerList}}
      >
        {{#each @trainings as |training index|}}
          <li class="results-recommendation-engine-training-list__item">
            <div
              role="group"
              aria-roledescription={{t "pages.skill-review.recommended-engine.trainings.slide-roledescription"}}
              aria-label={{this.slideAriaLabel index}}
            ><TrainingCard
                @training={{training}}
                @onCardClick={{@onCardClick}}
                @onModalButtonClick={{@onModalButtonClick}}
                @onModalAccordionClick={{@onModalAccordionClick}}
              /></div>
          </li>
        {{/each}}
        {{#if this.areNavigationButtonsVisible}}
          <li
            class="results-recommendation-engine-training__list-spacer"
            aria-hidden="true"
            style={{this.spacerStyle}}
          ></li>
        {{/if}}
      </ul>
    </section>
  </template>
}
