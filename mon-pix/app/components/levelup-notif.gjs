import { PixIcon } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import modifierDidInsert from 'mon-pix/modifiers/modifier-did-insert';

export default class LevelupNotif extends Component {
  <template>
    <div {{modifierDidInsert this.resetLevelUp @level @competenceName}}>
      {{#unless this.closeLevelup}}
        <div class="levelup">
          <img src="/images/levelup.svg" alt />
          <div class="levelup__icon-card-level">{{@level}}</div>
          <div class="levelup__competence">
            <div class="levelup-competence__level">{{t "pages.levelup-notif.obtained-level" level=@level}}</div>
            <div class="levelup-competence__name">{{@competenceName}}</div>
          </div>
          <button class="levelup__close" aria-labelledby="button-label" type="button" {{on "click" this.close}}>
            <span id="button-label" hidden>{{t "common.actions.close"}}</span>
            <PixIcon @name="cancel" @ariaHidden={{true}} />
          </button>
        </div>
      {{/unless}}
    </div>
  </template>
  @tracked closeLevelup = false;

  resetLevelUp = () => {
    this.closeLevelup = false;
  };

  @action
  close() {
    this.closeLevelup = true;
  }
}
