import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { hash } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import SearchForm from 'pix-admin/components/certifications/search-form';
<template>
  {{pageTitle "Toutes les sessions"}}
  <div class="page">
    <header class="header">
      <h1>{{t "pages.sessions.title"}}</h1>
      <SearchForm />
    </header>

    <main class="page-body">
      <PixTabs @variant="primary" @ariaLabel="Navigation de la section sessions" class="navigation">
        <LinkTo @route="authenticated.sessions.list.with-required-action" @query={{hash version=3}}>
          {{t "pages.sessions.list.required-actions.v3"}}
          ({{@controller.v3SessionsWithRequiredActionCount}})
        </LinkTo>
        <LinkTo @route="authenticated.sessions.list.to-be-published" @query={{hash version=3}}>
          {{t "pages.sessions.list.to-be-published.v3"}}
          ({{@controller.v3SessionsToBePublishedCount}})
        </LinkTo>
        <LinkTo @route="authenticated.sessions.list.all">
          {{t "pages.sessions.list.all"}}
        </LinkTo>
        <LinkTo @route="authenticated.sessions.list.with-required-action" @query={{hash version=2}}>
          {{t "pages.sessions.list.required-actions.v2"}}
          ({{@controller.v2SessionsWithRequiredActionCount}})
        </LinkTo>
        <LinkTo @route="authenticated.sessions.list.to-be-published" @query={{hash version=2}}>
          {{t "pages.sessions.list.to-be-published.v2"}}
          ({{@controller.v2SessionsToBePublishedCount}})
        </LinkTo>
      </PixTabs>
      <section class="page-section">
        {{outlet}}
      </section>
    </main>
  </div>
</template>
