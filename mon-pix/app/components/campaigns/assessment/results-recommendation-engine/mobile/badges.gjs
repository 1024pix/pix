import { PixIconButton } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { modifier } from 'ember-modifier';
import MarkdownToHtml from 'mon-pix/components/markdown-to-html';

export default class MobileBadges extends Component {
  @tracked _selectedTab = null;

  list = null;

  hasManyBadges = (badges) => badges.length > 1;

  registerList = modifier((element) => {
    this.list = element;
  });

  get acquiredBadges() {
    return this.args.badges.filter(({ isAcquired }) => isAcquired);
  }

  get notAcquiredBadges() {
    return this.args.badges.filter(({ isAcquired, isAlwaysVisible }) => !isAcquired && isAlwaysVisible);
  }

  get selectedTab() {
    return this._selectedTab ?? (this.acquiredBadges.length ? 'acquired' : 'not-acquired');
  }

  get isAcquiredTab() {
    return this.selectedTab === 'acquired';
  }

  get displayedBadges() {
    return this.isAcquiredTab ? this.acquiredBadges : this.notAcquiredBadges;
  }

  @action selectTab(tab) {
    this._selectedTab = tab;
    this.list?.scrollTo({ left: 0 });
  }

  @action scroll(direction) {
    const card = this.list?.firstElementChild;
    if (!card) return;
    this.list.scrollBy({ left: direction * (card.offsetWidth + 12), behavior: 'smooth' });
  }

  <template>
    <section class="reco-mobile-section reco-mobile-badges">
      <h2 class="reco-mobile-section__title">{{t "pages.skill-review.recommended-engine.mobile.badges.title"}}</h2>
      <p class="reco-mobile-section__description">{{t
          "pages.skill-review.recommended-engine.mobile.badges.description"
        }}</p>

      <div class="reco-mobile-badges__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          class="reco-mobile-badges__tab {{if this.isAcquiredTab 'reco-mobile-badges__tab--selected'}}"
          aria-selected={{if this.isAcquiredTab "true" "false"}}
          {{on "click" (fn this.selectTab "acquired")}}
        >{{t "pages.skill-review.recommended-engine.mobile.badges.acquired-tab"}}</button>
        <button
          type="button"
          role="tab"
          class="reco-mobile-badges__tab {{unless this.isAcquiredTab 'reco-mobile-badges__tab--selected'}}"
          aria-selected={{if this.isAcquiredTab "false" "true"}}
          {{on "click" (fn this.selectTab "not-acquired")}}
        >{{t "pages.skill-review.recommended-engine.mobile.badges.not-acquired-tab"}}</button>
      </div>

      {{#if this.displayedBadges.length}}
        <ul class="reco-mobile-badges__list" role="tabpanel" {{this.registerList}}>
          {{#each this.displayedBadges as |badge|}}
            <li class="reco-mobile-badge {{unless badge.isAcquired 'reco-mobile-badge--not-acquired'}}">
              <div class="reco-mobile-badge__image">
                <img src={{badge.imageUrl}} alt="" />
              </div>
              <span class="reco-mobile-badge__tag">
                {{if
                  badge.isAcquired
                  (t "pages.skill-review.badge-card.acquired")
                  (t "pages.skill-review.badge-card.not-acquired")
                }}
              </span>
              <h3 class="reco-mobile-badge__title">{{badge.title}}</h3>
              <div class="reco-mobile-badge__message">
                <MarkdownToHtml @markdown={{badge.message}} @isInline={{true}} />
              </div>
            </li>
          {{/each}}
        </ul>

        {{#if (this.hasManyBadges this.displayedBadges)}}
          <div class="reco-mobile-badges__navigation">
            <PixIconButton
              @ariaLabel={{t "pages.skill-review.recommended-engine.mobile.badges.previous"}}
              @variant="secondary"
              @iconName="chevronLeft"
              @triggerAction={{fn this.scroll -1}}
            />
            <PixIconButton
              @ariaLabel={{t "pages.skill-review.recommended-engine.mobile.badges.next"}}
              @variant="secondary"
              @iconName="chevronRight"
              @triggerAction={{fn this.scroll 1}}
            />
          </div>
        {{/if}}
      {{else}}
        <p class="reco-mobile-badges__empty">{{t "pages.skill-review.recommended-engine.mobile.badges.empty"}}</p>
      {{/if}}
    </section>
  </template>
}
