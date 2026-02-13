import PixTabs from '@1024pix/pix-ui/components/pix-tabs';

<template>
  <header class="page-header">
    {{yield to="breadCrumb"}}

  </header>

  <main class="page-body" id="organizations-get-page">
    {{yield to="headSection"}}

    {{#if (has-block "alert")}}
      {{yield to="alert"}}
    {{/if}}
    {{#if (has-block "navigationLinks")}}
      <PixTabs @variant="primary" @ariaLabel={{@navigationAriaLabel}} class="navigation">
        {{yield to="navigationLinks"}}
      </PixTabs>
    {{/if}}

    {{#if (has-block "outlet")}}
      {{yield to="outlet"}}
    {{/if}}

    {{yield}}
  </main>
</template>
