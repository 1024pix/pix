import t from 'ember-intl/helpers/t';
import FocusIcon from 'mon-pix/components/challenge/mode/focus-icon';
import FreeIcon from 'mon-pix/components/challenge/mode/free-icon';

<template>
  <div class="mode-banner {{if @isFocusedChallenge 'mode-banner--focus' 'mode-banner--free'}}">
    <div class="mode-banner__icon">
      {{#if @isFocusedChallenge}}
        <FocusIcon />
      {{else}}
        <FreeIcon />
      {{/if}}
    </div>
    <div class="mode-banner__explanation">
      <h2 class="mode-banner__text">
        <span class="mode-banner__title">
          {{t
            (if
              @isFocusedChallenge
              "components.challenge.mode-banner.focused.title"
              "components.challenge.mode-banner.free.title"
            )
          }}
        </span>

        {{t
          (if
            @isFocusedChallenge
            "components.challenge.mode-banner.focused.content"
            "components.challenge.mode-banner.free.content"
          )
        }}

      </h2>
    </div>

  </div>
</template>
