import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { on } from '@ember/modifier';
import { action, trySet } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { eq } from 'ember-truth-helpers';

export default class ChallengeMedia extends Component {
  //Si la propriété @type n'est pas renseignée, par défaut on considère que c'est une image !

  hiddenClass = 'challenge-media__loaded-image--hidden';
  displayPlaceholder = true;

  @action
  onMediaLoaded() {
    trySet(this, 'displayPlaceholder', false);
    trySet(this, 'hiddenClass', null);
  }

  <template>
    <div>
      {{#if this.displayPlaceholder}}
        <div class="challenge-media__placeholder" aria-label="{{t 'pages.challenge.media.placeholder'}}">
          {{#if (eq @type "video")}}
            <PixIcon @name="videocam" @ariaHidden={{true}} />
          {{else}}
            <PixIcon @name="image" @ariaHidden={{true}} />
          {{/if}}
        </div>
      {{/if}}
      {{#if (eq @type "video")}}
        <video
          controls
          class="challenge-media__loaded-image {{this.hiddenClass}}"
          {{on "loadeddata" this.onMediaLoaded}}
          aria-label="video"
          src={{@src}}
        >
          <track kind="captions" />
        </video>
      {{else}}
        <img
          src={{@src}}
          alt={{@alt}}
          class="challenge-media__loaded-image {{this.hiddenClass}}"
          {{on "load" this.onMediaLoaded}}
        />
      {{/if}}
    </div>
  </template>
}
