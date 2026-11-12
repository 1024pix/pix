import t from 'ember-intl/helpers/t';

<template>
  <div class="mode-banner {{if @isFocusedChallenge 'mode-banner--focus' 'mode-banner--free'}}">
    <div class="mode-banner__icon">
      <img
        src="/images/challenge/{{if @isFocusedChallenge 'focus-mode.svg' 'free-mode.svg'}}"
        alt=""
        role="presentation"
      />
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
