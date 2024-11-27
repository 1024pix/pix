import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixProgressGauge from '@1024pix/pix-ui/components/pix-progress-gauge';
import PixSidebar from '@1024pix/pix-ui/components/pix-sidebar';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';

export default class ModulixNavbar extends Component {
  @service intl;

  static #padding = 2 * ModulixNavbar.#getCssVarValue('--pix-spacing-4x');
  static #buttonBorderWidth = 2 * 2;
  static #buttonPadding = 2 * ModulixNavbar.#getCssVarValue('--pix-spacing-2x');
  static #textFontSize = 14; // 1rem in mobile
  static HEIGHT =
    ModulixNavbar.#padding +
    ModulixNavbar.#buttonBorderWidth +
    ModulixNavbar.#buttonPadding +
    ModulixNavbar.#textFontSize;

  static #getCssVarValue(varName) {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).slice(0, -2);
  }

  get progressValue() {
    if (this.args.totalSteps <= 1) {
      return 100;
    }
    return ((this.args.currentStep - 1) / (this.args.totalSteps - 1)) * 100;
  }

  @tracked
  sidebarOpened = false;

  @action
  openSidebar() {
    this.sidebarOpened = true;
  }

  @action
  closeSidebar() {
    this.sidebarOpened = false;
  }

  get grainTypeTexts() {
    return this.args.grainsToDisplay.map((grain) => this.intl.t(`pages.modulix.grain.tag.${grain.type}`));
  }

  get currentGrainIndex() {
    return this.grainTypeTexts.length - 1;
  }

  <template>
    <nav
      class="module-navbar"
      aria-label={{t "pages.modulix.flashcards.navigation.currentStep" current=@currentStep total=@totalSteps}}
    >
      <div class="module-navbar__content">
        <PixButton
          @variant="tertiary"
          @triggerAction={{this.openSidebar}}
          aria-label={{t "pages.modulix.sidebar.button"}}
        >
          {{t "pages.modulix.flashcards.navigation.currentStep" current=@currentStep total=@totalSteps}}
        </PixButton>

        <PixProgressGauge @hidePercentage={{true}} @isDecorative={{true}} @value={{this.progressValue}} />
      </div>
    </nav>

    <PixSidebar @title={{@module.title}} @showSidebar={{this.sidebarOpened}} @onClose={{this.closeSidebar}}>
      <:content>
        <nav>
          <ul>
            {{#each this.grainTypeTexts as |type index|}}
              <li
                class="module-sidebar-list-item__link {{if (eq index this.currentGrainIndex) 'current-grain'}}"
                aria-current={{if (eq index this.currentGrainIndex) "step"}}
              >
                {{type}}
              </li>
            {{/each}}
          </ul>
        </nav>
      </:content>
    </PixSidebar>
  </template>
}
