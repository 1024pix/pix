import PixModal from '@1024pix/pix-ui/components/pix-modal';
import htmlUnsafe from 'mon-pix/helpers/html-unsafe';
import PixNavigation from '@1024pix/pix-ui/components/pix-navigation';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import didInsert from '../../../modifiers/modifier-did-insert';
import ModulixNavigationButton from './navigation-button';
import GlossaryNavigationButton from './glossary-navigation-button';

export default class ModulixNavigation extends Component {
  @service modulixNavigationProgress;

  @action isCurrentSection(index) {
    return this.modulixNavigationProgress.currentSectionIndex === index;
  }

  @action isPastSection(index) {
    return this.modulixNavigationProgress.currentSectionIndex > index;
  }

  @action handleArrowKeyNavigation(event) {
    const triggeredButton = document.activeElement;
    const triggeredButtonParent = triggeredButton.parentElement;
    const navigationButtonsList = triggeredButtonParent.parentNode.children;
    const triggeredButtonParentIndex = Array.from(navigationButtonsList).indexOf(triggeredButtonParent);

    const trackedEventsKey = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'];

    if (trackedEventsKey.indexOf(event.key) === -1) return;

    event.preventDefault();

    if (
      (event.key === 'ArrowDown' || event.key === 'ArrowRight') &&
      triggeredButtonParentIndex + 1 < this.sectionsLength
    ) {
      const nextButton = triggeredButtonParent.nextElementSibling.firstElementChild;
      nextButton.focus();
      return;
    }

    if ((event.key === 'ArrowUp' || event.key === 'ArrowLeft') && triggeredButtonParentIndex >= 1) {
      const previousButton = triggeredButtonParent.previousElementSibling.firstElementChild;
      previousButton.focus();
    }
  }

  get sectionsLength() {
    return this.args.sections.length;
  }

  get hasGlossary() {
    return this.args.glossary?.length > 0;
  }

  @action currentSectionIndex(section) {
    return this.args.sections.indexOf(section) + 1;
  }

  @action
  setHTMLElementOffset(htmlElement) {
    const bannerElement = document.getElementById('pix-layout-banner-container');
    if (!bannerElement) return;
    const distanceBetweenNavigationAndBanner = 8;
    const top = bannerElement.getBoundingClientRect().height + distanceBetweenNavigationAndBanner;
    htmlElement.style.setProperty('top', `${top}px `);
  }

  <template>
    <PixNavigation
      id="module-navigation"
      class="app-navigation module-navigation"
      @navigationAriaLabel={{t "navigation.nav-bar.aria-label"}}
      @openLabel={{t "navigation.nav-bar.open"}}
      @closeLabel={{t "navigation.nav-bar.close"}}
      {{didInsert this.setHTMLElementOffset}}
    >
      <:brand>
        <img class="module-navigation__logo" src="/images/modulix-pix-logo.svg" alt={{t "navigation.homepage"}} />
      </:brand>
      <:navElements>
        {{#each @sections as |section index|}}
          <ModulixNavigationButton
            @section={{section}}
            @isCurrentSection={{this.isCurrentSection index}}
            @isPastSection={{this.isPastSection index}}
            @sectionsLength={{this.sectionsLength}}
            @currentSectionIndex={{this.currentSectionIndex section}}
            @handleArrowKeyNavigation={{this.handleArrowKeyNavigation}}
          />
        {{/each}}
      </:navElements>
      <:footer>
        {{#if this.hasGlossary}}
          <GlossaryNavigationButton
            @glossary={{this.args.glossary}}
          />
        {{/if}}
      </:footer>
    </PixNavigation>
  </template>
}
