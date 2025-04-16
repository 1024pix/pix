import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixProgressBar from '@1024pix/pix-ui/components/pix-progress-bar';
import PixSidebar from '@1024pix/pix-ui/components/pix-sidebar';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';

export default class ModulixNavbar extends Component {
  @service intl;

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
    this.args.onSidebarOpen();
  }

  @action
  closeSidebar() {
    this.sidebarOpened = false;
  }

  get grainsWithIdAndTranslatedType() {
    return this.args.grainsToDisplay.map((grain) => ({
      type: this.intl.t(`pages.modulix.grain.tag.${grain.type}`),
      id: grain.id,
    }));
  }

  get currentGrainIndex() {
    return this.grainsWithIdAndTranslatedType.length - 1;
  }

  @action
  onMenuItemClick(grainId) {
    this.closeSidebar();
    this.args.goToGrain(grainId);
  }

  <template>
    <nav
      id="module-navbar"
      class="module-navbar"
      aria-label={{t "pages.modulix.flashcards.navigation.longCurrentStep" current=@currentStep total=@totalSteps}}
    >
      <div class="module-navbar__content">
        <PixButton
          @triggerAction={{this.openSidebar}}
          @iconBefore="book"
          @variant="secondary"
          aria-label={{t "pages.modulix.sidebar.button"}}
        >
          {{t "pages.modulix.flashcards.navigation.shortCurrentStep" current=@currentStep total=@totalSteps}}
        </PixButton>
        <PixProgressBar @hidePercentage={{true}} @isDecorative={{true}} @value={{this.progressValue}} />
      </div>
    </nav>

    <PixSidebar
      @title={{@module.title}}
      @showSidebar={{this.sidebarOpened}}
      @onClose={{this.closeSidebar}}
      @focusOnClose={{false}}
    >
      <:content>
        <nav>
          <ul>
            {{#each this.grainsWithIdAndTranslatedType as |grain index|}}
              <li>
                <button
                  type="button"
                  class="module-sidebar__list-item {{if (eq index this.currentGrainIndex) 'current-grain'}}"
                  aria-current={{if (eq index this.currentGrainIndex) "step"}}
                  {{on "click" (fn this.onMenuItemClick grain.id)}}
                >
                  {{grain.type}}
                </button>
              </li>
            {{/each}}
          </ul>
        </nav>
      </:content>
    </PixSidebar>
  </template>
}
