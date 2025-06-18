import PixProgressBar from '@1024pix/pix-ui/components/pix-progress-bar';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class ModulixNavbar extends Component {
  @service intl;

  get progressValue() {
    if (this.args.totalSteps <= 1) {
      return 100;
    }
    return ((this.args.currentStep - 1) / (this.args.totalSteps - 1)) * 100;
  }

  <template>
    <nav
      id="module-navbar"
      class="module-navbar"
      aria-label={{t "pages.modulix.flashcards.navigation.longCurrentStep" current=@currentStep total=@totalSteps}}
    >
      <div class="module-navbar__content">
        <PixProgressBar @hidePercentage={{true}} @isDecorative={{true}} @value={{this.progressValue}} />
      </div>
    </nav>
  </template>
}
