<template>
  <section class="global-page-header">
    <div class="global-page-header__left-content">
      <h1 class="global-page-header__title">
        {{yield to="title"}}
      </h1>
      {{#if (has-block "subtitle")}}
        <p class="global-page-header__description">
          {{yield to="subtitle"}}
        </p>
      {{/if}}
    </div>

    {{#if (has-block "extraContent")}}
      <div class="global-page-header__right-content">
        {{#if (has-block "extraContentTitle")}}
          <h2 class="sr-only">{{yield to="extraContentTitle"}}</h2>
        {{/if}}
        {{yield to="extraContent"}}
      </div>
    {{/if}}
  </section>
</template>
