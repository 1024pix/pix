import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Breadcrumb from 'pix-admin/components/users/breadcrumb';
import UserOverview from 'pix-admin/components/users/user-overview';
<template>
  {{pageTitle "Utilisateur " @model.id}}
  <header class="page-header">
    <Breadcrumb @userId={{@model.id}} />
  </header>

  <main class="page-body">
    <UserOverview @user={{@model}} />

    <PixTabs @variant="primary" @ariaLabel="Navigation de la section détails d'un utilisateur" class="navigation">
      <LinkTo @route="authenticated.users.get.information" @model={{@model}}>
        {{t "pages.user-details.navbar.details"}}
      </LinkTo>

      <LinkTo @route="authenticated.users.get.authentication-methods" @model={{@model}}>
        {{t "pages.user-details.navbar.connections"}}
        ({{@model.authenticationMethodCount}})
      </LinkTo>

      <LinkTo @route="authenticated.users.get.profile" @model={{@model}}>
        {{t "pages.user-details.navbar.profile"}}
      </LinkTo>

      <LinkTo @route="authenticated.users.get.campaign-participations" @model={{@model}}>
        {{t "pages.user-details.navbar.participations-list"}}
        ({{@model.participationCount}})
      </LinkTo>

      <LinkTo
        @route="authenticated.users.get.organizations"
        @model={{@model}}
        aria-label="Organisations de l’utilisateur"
      >
        {{t "pages.user-details.navbar.organizations-list"}}
        ({{@model.organizationMembershipCount}})
      </LinkTo>

      <LinkTo
        @route="authenticated.users.get.certification-center-memberships"
        aria-label={{t "pages.user-details.navbar.certification-centers-list-aria-label"}}
      >
        {{t "pages.user-details.navbar.certification-centers-list"}}
        ({{@model.certificationCenterMembershipCount}})

      </LinkTo>

      <LinkTo @route="authenticated.users.get.certification-courses">
        {{t "pages.user-details.navbar.certification-courses"}}
      </LinkTo>

      <LinkTo
        @route="authenticated.users.get.cgu"
        @model={{@model}}
        aria-label={{t "pages.user-details.navbar.cgu-aria-label"}}
      >
        {{t "pages.user-details.navbar.cgu"}}
      </LinkTo>
    </PixTabs>

    {{outlet}}
  </main>
</template>
