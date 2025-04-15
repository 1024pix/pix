import PixBlock from '@1024pix/pix-ui/components/pix-block';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import { LinkTo } from '@ember/routing';
import pageTitle from 'ember-page-title/helpers/page-title';
import JoinRequestForm from 'pix-orga/components/auth/join-request-form';
import PageTitle from 'pix-orga/components/ui/page-title';
<template>
  {{pageTitle "Activez ou récupérez votre espace"}}
  <div class="join-request">
    <PixBlock class="join-request__panel">
      <div class="panel__image">
        <img src="/pix-orga-color.svg" alt role="none" />
      </div>
      {{#if @controller.isSubmit}}
        <p class="join-request__success">
          Un e-mail contenant la démarche à suivre a été envoyé
          <br />
          à l'adresse e-mail de votre établissement.
          <br />
          Si vous ne le recevez pas, vérifiez les courriers indésirables,<br />
          ou
          <a href="https://pix.fr/support/enseignement-scolaire">contactez le support</a>.
        </p>
      {{else}}
        <PageTitle>
          <:title>
            Activez ou récupérez votre espace
          </:title>
        </PageTitle>

        <p class="join-request__description">
          A l'attention des personnels de direction des établissements
          <br />
          scolaires publics et privés sous contrat.
          <br />
          <br />
          Saisissez ces informations pour recevoir un lien d'activation à l'adresse e-mail de votre établissement et
          devenir administrateur de l'espace Pix Orga.
        </p>

        {{#if @controller.errorMessage}}
          <p class="join-request__error-message error-message">
            {{@controller.errorMessage}}
            Merci de
            <a href="https://pix.fr/support/enseignement-scolaire">contacter le support</a>.
          </p>
        {{/if}}

        <JoinRequestForm @onSubmit={{@controller.createScoOrganizationInvitation}} />
      {{/if}}

      <LinkTo @route="login" class="join-request-form__back">
        <PixIcon @name="arrowLeft" />
        Revenir à la page de connexion
      </LinkTo>
    </PixBlock>
  </div>
</template>
