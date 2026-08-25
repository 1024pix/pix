import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { modifier } from 'ember-modifier';
import onIntersect from 'mon-pix/modifiers/on-intersect';

import TrainingCard from './training/card';

export const TRAININGS_LIST_ID = 'results-recommendation-engine-training-list';
const TRAININGS_PER_PAGE = 3;

export default class Trainings extends Component {
  @tracked currentPageFirstCardIndex = 0;

  list = null;

  registerList = modifier((element) => {
    this.list = element;
    window.addEventListener('resize', this.resyncScrollPosition);

    return () => {
      window.removeEventListener('resize', this.resyncScrollPosition);
    };
  });

  get cards() {
    return this.list.children;
  }

  get isPreviousButtonDisabled() {
    return this.currentPageFirstCardIndex === 0;
  }

  get isNextButtonDisabled() {
    return this.currentPageFirstCardIndex + TRAININGS_PER_PAGE >= this.args.trainings.length;
  }

  @action
  scrollToPreviousTrainings() {
    this.goToCardIndex(Math.max(this.currentPageFirstCardIndex - TRAININGS_PER_PAGE, 0));
  }

  @action
  scrollToNextTrainings() {
    this.goToCardIndex(Math.min(this.currentPageFirstCardIndex + TRAININGS_PER_PAGE, this.args.trainings.length - 1));
  }

  @action
  resyncScrollPosition() {
    this.goToCardIndex(this.currentPageFirstCardIndex, 'instant');
  }

  goToCardIndex(index, behavior = 'smooth') {
    this.currentPageFirstCardIndex = index;
    const targetCard = this.cards[index];
    this.list.scrollTo({ left: targetCard.offsetLeft, behavior });
  }

  <template>
    <section
      id={{TRAININGS_LIST_ID}}
      tabindex="-1"
      class="results-recommendation-engine-training"
      {{onIntersect @onFullyVisible threshold=1}}
    >
      <div class="results-recommendation-engine-training__header">
        <div>
          <h2 class="results-recommendation-engine-training__title">{{t
              "pages.skill-review.recommended-engine.trainings.title"
            }}</h2>
          <p class="results-recommendation-engine-training__description">{{t
              "pages.skill-review.recommended-engine.trainings.description"
            }}</p>
        </div>

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
      </div>

      <ul class="results-recommendation-engine-training__list" {{this.registerList}}>
        {{#each @trainings as |training|}}
          <li class="results-recommendation-engine-training-list__item"><TrainingCard
              @training={{training}}
              @onCardClick={{@onCardClick}}
              @onModalButtonClick={{@onModalButtonClick}}
              @onModalAccordionClick={{@onModalAccordionClick}}
            /></li>
        {{/each}}
      </ul>
    </section>
  </template>
}
