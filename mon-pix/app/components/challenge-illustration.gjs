import { PixIcon } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action, trySet } from '@ember/object';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class ChallengeIllustration extends Component {
  <template>
    <div data-test-id="challenge-illustration">
      {{#if this.displayPlaceholder}}
        <div class="challenge-illustration__placeholder" aria-label="{{t 'pages.challenge.illustration.placeholder'}}">
          <PixIcon @name="image" />
        </div>
      {{/if}}

      <img
        src="{{@src}}"
        alt="{{this.alt}}"
        class="challenge-illustration__loaded-image {{this.hiddenClass}}"
        {{on "load" this.onImageLoaded}}
      />

    </div>
  </template>
  hiddenClass = 'challenge-illustration__loaded-image--hidden';
  displayPlaceholder = true;

  get alt() {
    return this.args.alt ?? '';
  }

  @action
  onImageLoaded() {
    trySet(this, 'displayPlaceholder', false);
    trySet(this, 'hiddenClass', null);
  }
}
