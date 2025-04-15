import PixBlock from '@1024pix/pix-ui/components/pix-block';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import LoginForm from 'pix-orga/components/auth/login-form';
import LanguageSwitcher from 'pix-orga/components/language-switcher';
import PageTitle from 'pix-orga/components/ui/page-title';
<template>
  {{pageTitle (t "pages.login.title")}}
  <main class="login-page">
    <div>
      <PixBlock class="login-page__container">
        <header class="login-page__header">
          <img src="/pix-orga-color.svg" alt="Pix Orga" />
          <PageTitle @centerTitle={{true}}>
            <:title>
              {{t "pages.login.title"}}
            </:title>
          </PageTitle>

        </header>

        <LoginForm
          @isWithInvitation={{false}}
          @hasInvitationAlreadyBeenAccepted={{@controller.hasInvitationAlreadyBeenAccepted}}
          @isInvitationCancelled={{@controller.isInvitationCancelled}}
        />
      </PixBlock>

      {{#if @controller.isInternationalDomain}}
        <LanguageSwitcher
          @selectedLanguage={{@controller.selectedLanguage}}
          @onLanguageChange={{@controller.onLanguageChange}}
        />
      {{/if}}
    </div>
  </main>
</template>
