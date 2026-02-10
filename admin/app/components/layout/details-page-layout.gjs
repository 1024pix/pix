import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import Breadcrumb from 'pix-admin/components/organizations/breadcrumb';

<template>
  <header class="page-header">
    <Breadcrumb @currentPageLabel={{@currentPageLabel}} />

  </header>

  <main class="page-body" id="organizations-get-page">
    {{yield to="headSection"}}

    {{#if (has-block "alert")}}
      {{yield to="alert"}}
    {{/if}}

    <PixTabs @variant="primary" @ariaLabel={{@navigationAriaLabel}} class="navigation">

      {{yield to="navigationLinks"}}
    </PixTabs>

    {{#if (has-block "outlet")}}
      {{yield to="outlet"}}
    {{/if}}

    {{yield}}
  </main>
</template>
