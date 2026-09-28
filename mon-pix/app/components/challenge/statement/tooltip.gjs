import { PixButton } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import onKey from 'ember-keyboard/modifiers/on-key';

export default class Tooltip extends Component {
  <template>
    <div class="tooltip__tag tooltip__tag{{if this.isFocusedChallenge '--focused' '--regular'}}">
      <button
        type="button"
        aria-controls="tooltip-tag-info"
        aria-expanded="{{this.shouldDisplayTooltip}}"
        aria-label={{t "pages.challenge.statement.tooltip.aria-label"}}
        class="tooltip-tag__icon-button"
        {{on "mouseenter" (fn this.displayTooltip true)}}
        {{on "mouseleave" (fn this.displayTooltip false)}}
        {{on "click" (fn this.displayTooltip true)}}
      ></button>

      <div
        id="tooltip-tag-info"
        class="tooltip-tag__information"
        tabindex="0"
        {{onKey "Escape" (fn this.displayTooltip false) event="keyup"}}
        {{on "focusout" (fn this.displayTooltip false)}}
      >
        <h3 class="tooltip-tag-information__title">
          {{t
            (if
              this.isFocusedChallenge
              "pages.challenge.statement.tooltip.focused.title"
              "pages.challenge.statement.tooltip.other.title"
            )
          }}
        </h3>

        <p class="tooltip-tag-information__text">
          {{t
            (if
              this.isFocusedChallenge
              "pages.challenge.statement.tooltip.focused.content"
              "pages.challenge.statement.tooltip.other.content"
            )
            htmlSafe=true
          }}
        </p>
        {{#if this.shouldDisplayButton}}
          <PixButton
            class="tooltip-tag-information__button"
            @size="small"
            @triggerAction={{this.confirmInformationIsRead}}
          >
            {{t "pages.challenge.statement.tooltip.close"}}
          </PixButton>
        {{/if}}
      </div>
    </div>
  </template>
  @service currentUser;
  @tracked shouldDisplayTooltip = false;

  constructor() {
    super(...arguments);
    this._showTooltip();
  }

  get isFocusedChallenge() {
    return this.args.challenge.focused;
  }

  _showTooltip() {
    if (
      (this.isFocusedChallenge && this._hasUserNotSeenFocusedChallengeTooltip()) ||
      (!this.isFocusedChallenge && this._hasUserNotSeenOtherChallengesTooltip())
    ) {
      this.shouldDisplayTooltip = true;
    } else {
      this.shouldDisplayTooltip = false;
    }
  }

  @action
  displayTooltip(value) {
    if (this.isFocusedChallenge && this._hasUserSeenFocusedChallengeTooltip()) {
      this.shouldDisplayTooltip = value;
    } else if (!this.isFocusedChallenge && this._hasUserSeenOtherChallengesTooltip()) {
      this.shouldDisplayTooltip = value;
    } else if (!this._isUserConnected()) {
      this.shouldDisplayTooltip = value;
    }
  }

  get shouldDisplayButton() {
    if (this.isFocusedChallenge && this._hasUserNotSeenFocusedChallengeTooltip()) {
      return true;
    } else if (!this.isFocusedChallenge && this._hasUserNotSeenOtherChallengesTooltip()) {
      return true;
    }
    return false;
  }

  _hasUserSeenFocusedChallengeTooltip() {
    return this._isUserConnected() && this.currentUser.user.hasSeenFocusedChallengeTooltip;
  }

  _hasUserNotSeenFocusedChallengeTooltip() {
    return this._isUserConnected() && !this.currentUser.user.hasSeenFocusedChallengeTooltip;
  }

  _hasUserSeenOtherChallengesTooltip() {
    return this._isUserConnected() && this.currentUser.user.hasSeenOtherChallengesTooltip;
  }

  _hasUserNotSeenOtherChallengesTooltip() {
    return this._isUserConnected() && !this.currentUser.user.hasSeenOtherChallengesTooltip;
  }

  _isUserConnected() {
    return this.currentUser.user;
  }

  @action
  async confirmInformationIsRead() {
    this.shouldDisplayTooltip = false;
    await this._rememberUserHasSeenChallengeTooltip();
  }

  async _rememberUserHasSeenChallengeTooltip() {
    if (!this.currentUser.user) return;

    if (this.args.challenge.focused && !this.currentUser.user.hasSeenFocusedChallengeTooltip) {
      await this.currentUser.user.save({ adapterOptions: { tooltipChallengeType: 'focused' } });
    } else if (!this.args.challenge.focused && !this.currentUser.user.hasSeenOtherChallengesTooltip) {
      await this.currentUser.user.save({ adapterOptions: { tooltipChallengeType: 'other' } });
    }
  }
}
