import PixProgressGauge from '@1024pix/pix-ui/components/pix-progress-gauge';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class ModulixNavbar extends Component {
  get progressValue() {
    if (this.args.totalSteps <= 1) {
      return 100;
    }
    return ((this.args.currentStep - 1) / (this.args.totalSteps - 1)) * 100;
  }

  <template>
    <nav
      class="module-navbar"
      aria-label={{t "pages.modulix.flashcards.navigation.currentStep" current=@currentStep total=@totalSteps}}
    >
      <div class="module-navbar__content">
        <div class="module-navbar__content__current-step">
          {{@currentStep}}/{{@totalSteps}}
        </div>

        <PixProgressGauge @hidePercentage={{true}} @isDecorative={{true}} @value={{this.progressValue}} />
      </div>
    </nav>
  </template>
}
