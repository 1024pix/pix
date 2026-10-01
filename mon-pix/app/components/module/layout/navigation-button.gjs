import { PixButton, PixIconButton } from '@1024pix/nebulix-ember';
import onEscapeAction from '@1024pix/nebulix-ember/modifiers/on-escape-action';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { SECTION_TITLE_ICONS } from 'mon-pix/models/section';

export default class ModulixNavigationButton extends Component {
  @service intl;
  @service media;
  @service modulixAutoScroll;
  @service pixMetrics;

  @tracked isTooltipVisible = false;

  @action
  mobileSectionTitle(type) {
    return this.tooltipText(type);
  }

  @action
  sectionTitle(type) {
    return this.intl.t(`pages.modulix.section.${type}`);
  }

  @action
  sectionTitleIcon(type) {
    return SECTION_TITLE_ICONS[type];
  }

  @action
  tooltipText(type) {
    const sectionTitle = this.intl.t(`pages.modulix.section.${type}`);

    if (this.args.isCurrentSection || this.args.isPastSection) {
      return sectionTitle;
    }

    return this.intl.t('pages.modulix.navigation.tooltip.disabled', {
      sectionTitle,
    });
  }

  get buttonClass() {
    if (this.args.isCurrentSection) {
      return '--current';
    }
    if (this.args.isPastSection) {
      return '--enabled';
    }
    return '--disabled';
  }

  get isDisabled() {
    return !this.args.isPastSection && !this.args.isCurrentSection;
  }

  get isCurrentSection() {
    return this.args.isCurrentSection ? 'step' : false;
  }

  get isPlainIcon() {
    return this.isTooltipVisible && (this.args.isPastSection || this.args.isCurrentSection);
  }

  @action
  scrollToSection() {
    if (this.isDisabled) {
      return;
    }

    const htmlElement = document.querySelector(`#section_${this.args.section.type}`);

    this.modulixAutoScroll.focusAndScroll(htmlElement);

    this.pixMetrics.trackEvent('Clic sur le bouton de la navigation', {
      category: 'Modulix',
      sectionId: this.args.section.id,
    });
  }

  @action
  showTooltip() {
    this.isTooltipVisible = true;
  }

  @action
  hideTooltip() {
    setTimeout(() => (this.isTooltipVisible = false));
  }

  @action
  hideTooltipOnMouseOut(event) {
    const isFocused = event.target.contains(document.activeElement);

    if (isFocused) {
      return;
    }

    this.hideTooltip(event);
  }

  get ariaLabelButton() {
    const steps = this.intl.t('pages.modulix.navigation.buttons.aria-label.steps', {
      indexSection: this.args.currentSectionIndex,
      totalSections: this.args.sectionsLength,
    });

    if (this.isDisabled) {
      return `${steps} ${this.intl.t('pages.modulix.navigation.buttons.aria-label.disabled')}`;
    }
    return `${steps} ${this.intl.t('pages.modulix.navigation.buttons.aria-label.enabled', {
      sectionTitle: this.sectionTitle(this.args.section.type),
    })}`;
  }

  <template>
    {{#if this.media.isMobile}}
      <PixButton
        class="module-navigation-mobile-button module-navigation-mobile-button{{this.buttonClass}}"
        @triggerAction={{this.scrollToSection}}
        @iconBefore={{this.sectionTitleIcon @section.type}}
        @isDisabled={{this.isDisabled}}
        aria-label={{this.ariaLabelButton}}
        aria-current="{{this.isCurrentSection}}"
      ><span class="module-navigation-mobile-button__text">{{this.mobileSectionTitle @section.type}}</span></PixButton>
    {{else}}
      <div
        class="navigation-tooltip {{if this.isTooltipVisible 'navigation-tooltip--visible' ''}}"
        {{onEscapeAction this.hideTooltip}}
        {{on "mouseleave" this.hideTooltipOnMouseOut}}
        {{on "mouseenter" this.showTooltip}}
        {{on "focusin" this.showTooltip}}
        {{on "focusout" this.hideTooltip}}
      >
        <PixIconButton
          class="module-navigation-button module-navigation-button{{this.buttonClass}}"
          @ariaLabel={{this.ariaLabelButton}}
          @triggerAction={{this.scrollToSection}}
          @iconName={{this.sectionTitleIcon @section.type}}
          @isDisabled={{this.isDisabled}}
          aria-current="{{this.isCurrentSection}}"
          @plainIcon={{this.isPlainIcon}}
          {{on "keydown" @handleArrowKeyNavigation}}
        />
        <span
          role="tooltip"
          class="navigation-tooltip__content navigation-tooltip__content{{this.buttonClass}}"
          aria-hidden="true"
        >
          {{this.tooltipText @section.type}}
        </span>
      </div>
    {{/if}}
  </template>
}
