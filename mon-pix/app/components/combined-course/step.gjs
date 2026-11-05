import { PixButton } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class Step extends Component {
  @service intl;

  get ctaText() {
    return 'Continuer';
  }

  <template>
    <main class="step-container">
      <div>

        <PixButton>{{this.ctaText}}</PixButton>
      </div>
      <div>

      </div>
    </main>
  </template>
}
