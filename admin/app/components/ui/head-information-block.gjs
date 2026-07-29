<template>
  <div class="head-information-block">
    {{#if (has-block "logo")}}
      <div class="head-information-block__logo-container">
        <div class="head-information-block__logo">
          {{yield to="logo"}}
        </div>
      </div>
    {{/if}}

    <div class="head-information-block__main-section">
      <div>
        <h1 class="head-information-block__title">{{@title}}</h1>
        {{#if (has-block "subtitle")}}
          <div class="head-information-block__subtitle">
            {{yield to="subtitle"}}
          </div>
        {{/if}}
      </div>
      {{#if (has-block "tagsSection")}}
        {{yield to="tagsSection"}}
      {{/if}}
    </div>

    {{#if (has-block "link")}}
      <div class="head-information-block__link">
        {{yield to="link"}}
      </div>
    {{/if}}
  </div>
</template>
