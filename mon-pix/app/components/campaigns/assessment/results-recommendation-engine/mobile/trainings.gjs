import { PixButton } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import onIntersect from 'mon-pix/modifiers/on-intersect';

import { TRAININGS_LIST_ID } from '../trainings';
import MobileTrainingCard from './training-card';

const VISIBLE_TRAININGS_COUNT = 3;

export default class MobileTrainings extends Component {
  @tracked isExpanded = false;

  get visibleTrainings() {
    return this.isExpanded ? this.args.trainings : this.args.trainings.slice(0, VISIBLE_TRAININGS_COUNT);
  }

  get hasHiddenTrainings() {
    return this.args.trainings.length > VISIBLE_TRAININGS_COUNT;
  }

  @action toggle() {
    this.isExpanded = !this.isExpanded;
  }

  <template>
    <section id={{TRAININGS_LIST_ID}} tabindex="-1" class="reco-mobile-section reco-mobile-trainings">
      <h2 class="reco-mobile-section__title">{{t "pages.skill-review.recommended-engine.mobile.trainings.title"}}</h2>

      <ul class="reco-mobile-trainings__list">
        {{#each this.visibleTrainings as |training|}}
          <li>
            <MobileTrainingCard
              @training={{training}}
              @onCardClick={{@onCardClick}}
              @onModalButtonClick={{@onModalButtonClick}}
              @onModalAccordionClick={{@onModalAccordionClick}}
            />
          </li>
        {{/each}}
      </ul>

      <div class="reco-mobile-trainings__footer" {{onIntersect @onFullyVisible threshold=1}}>
        {{#if this.hasHiddenTrainings}}
          <PixButton
            class="reco-mobile-trainings__toggle"
            @variant="secondary"
            @size="small"
            @iconAfter={{if this.isExpanded "chevronTop" "chevronBottom"}}
            @triggerAction={{this.toggle}}
            aria-expanded={{if this.isExpanded "true" "false"}}
          >
            {{if
              this.isExpanded
              (t "pages.skill-review.recommended-engine.mobile.trainings.show-less")
              (t "pages.skill-review.recommended-engine.mobile.trainings.show-more")
            }}
          </PixButton>
        {{/if}}
      </div>
    </section>
  </template>
}
