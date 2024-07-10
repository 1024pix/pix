import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';

import TabItem from './tab-item';
import TabPanel from './tab-panel';

export default class TabsContainer extends Component {
  @service elementHelper;

  TabPanel = TabPanel;
  TabItem = TabItem;

  @tracked currentTabIndex = this.args.initialTabIndex || 0;
  @tracked hasScrollableTablist = false;
  @tracked isLeftArrowVisible = false;
  @tracked isRightArrowVisible = false;

  elements = {
    tabs: null,
    tablist: null,
  };

  onMount = modifier((element) => {
    this.elements.tabs = element.querySelectorAll("[role='tab']");
    this.elements.tablist = element.querySelector("[role='tablist'] > div");

    this.handleResponsiveTablist();
    window.addEventListener('resize', this.handleResponsiveTablist);

    return () => {
      window.removeEventListener('resize', this.handleResponsiveTablist);
    };
  });

  get id() {
    return this.args.id || `pix-tabs-${guidFor(this)}`;
  }

  @action
  handleTablistKeyUp(event) {
    if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      const currentTabIndex = [...this.elements.tabs].findIndex((tab) => {
        return tab === document.activeElement;
      });

      let nextTabIndex;

      switch (event.key) {
        case 'ArrowRight':
          if (currentTabIndex === this.elements.tabs.length - 1) {
            nextTabIndex = 0;
          } else {
            nextTabIndex = currentTabIndex + 1;
          }
          break;
        case 'ArrowLeft':
          if (currentTabIndex === 0) {
            nextTabIndex = this.elements.tabs.length - 1;
          } else {
            nextTabIndex = currentTabIndex - 1;
          }
          break;
      }

      const tabToFocus = document.getElementById(this.id + '-' + nextTabIndex);
      tabToFocus.focus();

      if (this.hasScrollableTablist) this.handleKeyupFocusScroll(tabToFocus);
    }
  }

  @action
  handleTabChange(tabIndex) {
    if (tabIndex !== this.currentTabIndex) {
      this.currentTabIndex = tabIndex;
      this.args.onTabChange && this.args.onTabChange(tabIndex);
    }
  }

  @action
  handleResponsiveTablist() {
    this.hasScrollableTablist = this.elements.tablist.scrollWidth > this.elements.tablist.clientWidth;

    if (this.hasScrollableTablist) {
      this.handleTablistArrowsVisibility();

      const currentTab = this.elements.tabs[this.currentTabIndex];
      this.scrollToTab(currentTab, 'instant');
    } else {
      this.isLeftArrowVisible = false;
      this.isRightArrowVisible = false;
    }
  }

  @action
  handleTablistArrowsVisibility() {
    const maxScrollLeft = this.elements.tablist.scrollWidth - this.elements.tablist.clientWidth;

    switch (Math.round(this.elements.tablist.scrollLeft)) {
      case 0:
        this.isLeftArrowVisible = false;
        this.isRightArrowVisible = true;
        break;
      case maxScrollLeft:
        this.isLeftArrowVisible = true;
        this.isRightArrowVisible = false;
        break;
      default:
        this.isLeftArrowVisible = true;
        this.isRightArrowVisible = true;
    }
  }

  @action
  handleLeftArrowButtonClick() {
    const nextOverflowingTab = [...this.elements.tabs]
      .reverse()
      .find((tab) => tab.offsetLeft < this.elements.tablist.scrollLeft);

    this.scrollToTab(nextOverflowingTab);
  }

  @action
  handleRightArrowButtonClick() {
    const nextOverflowingTab = [...this.elements.tabs].find((tab) => {
      return tab.offsetLeft + tab.clientWidth > this.elements.tablist.scrollLeft + this.elements.tablist.clientWidth;
    });

    this.scrollToTab(nextOverflowingTab);
  }

  @action
  handleKeyupFocusScroll(tabToFocus) {
    const leftOverflowing = tabToFocus.offsetLeft - this.elements.tablist.scrollLeft < 0;
    const rightOverflowing =
      tabToFocus.offsetLeft + tabToFocus.clientWidth > tabToFocus.scrollLeft + this.elements.tablist.clientWidth;

    if (leftOverflowing || rightOverflowing) {
      if (tabToFocus.offsetLeft === 0) {
        this.elements.tablist.scrollTo({
          left: 0,
          behavior: 'smooth',
        });
      } else {
        this.scrollToTab(tabToFocus);
      }
    }
  }

  scrollToTab(tabToFocus, behavior = 'smooth') {
    const centeredTabPosition =
      tabToFocus.offsetLeft + 0.5 * tabToFocus.clientWidth - 0.5 * this.elements.tablist.clientWidth;

    this.elements.tablist.scrollTo({
      left: centeredTabPosition,
      behavior: behavior,
    });
  }

  <template>
    {{! template-lint-disable no-invalid-interactive }}
    <div class="pix-tabs" id={{this.id}} ...attributes {{this.onMount}}>
      <div class="pix-tabs__tablist" role="tablist" aria-label={{@ariaLabel}} {{on "keyup" this.handleTablistKeyUp}}>
        {{#if this.isLeftArrowVisible}}
          <span
            class="pix-tabs-tablist__scroll-button pix-tabs-tablist__scroll-button--left"
            tabindex="-1"
            {{on "click" this.handleLeftArrowButtonClick}}
          />
        {{/if}}
        <div {{on "scroll" this.handleTablistArrowsVisibility}}>
          {{yield
            (component this.TabItem currentTab=this.currentTabIndex id=this.id onTabClick=this.handleTabChange)
            to="tabs"
          }}
        </div>
        {{#if this.isRightArrowVisible}}
          <span
            class="pix-tabs-tablist__scroll-button pix-tabs-tablist__scroll-button--right"
            tabindex="-1"
            {{on "click" this.handleRightArrowButtonClick}}
          />
        {{/if}}
      </div>

      {{yield (component this.TabPanel currentTab=this.currentTabIndex id=this.id) to="panels"}}
    </div>
  </template>
}
