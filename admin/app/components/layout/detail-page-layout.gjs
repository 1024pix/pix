import PixTabs from '@1024pix/pix-ui/components/pix-tabs';

<template>
  <div class="detail-page-layout page-body">
    <header class="detail-page-layout__header">
      {{yield to="header"}}
    </header>

    {{yield to="alert"}}

    {{#if (has-block "navigationLinks")}}
      <PixTabs @variant="primary" @ariaLabel={{@navigationAriaLabel}}>
        {{yield to="navigationLinks"}}
      </PixTabs>
    {{/if}}

    {{#if (has-block "outlet")}}
      {{yield to="outlet"}}
    {{/if}}
  </div>
</template>
