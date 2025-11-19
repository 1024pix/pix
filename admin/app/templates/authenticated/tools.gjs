import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
<template>
  {{pageTitle "Outils"}}

  <div class="page tools">
    <header>
      <h1>Outils</h1>
    </header>

    <main class="page-body">
      <PixTabs @variant="primary" @ariaLabel={{t "pages.tools.navigation.aria-label"}} class="navigation">
        {{#unless @controller.currentUserRole.isCertif}}
          <LinkTo @route="authenticated.tools.campaigns">
            {{t "pages.administration.navigation.campaigns.label"}}
          </LinkTo>
          <LinkTo @route="authenticated.tools.junior">
            {{t "pages.administration.navigation.junior.label"}}
          </LinkTo>
        {{/unless}}
        {{#unless @controller.currentUserRole.isMetier}}
          <LinkTo @route="authenticated.tools.certification">
            {{t "pages.administration.navigation.certification.label"}}
          </LinkTo>
        {{/unless}}
      </PixTabs>

      {{outlet}}
    </main>
  </div>
</template>
