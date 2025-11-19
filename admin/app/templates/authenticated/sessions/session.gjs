import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixTabs from '@1024pix/pix-ui/components/pix-tabs';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import pageTitle from 'ember-page-title/helpers/page-title';
import Breadcrumb from 'pix-admin/components/sessions/breadcrumb';
<template>
  {{! template-lint-disable require-input-label }}
  {{pageTitle "Session " @model.id}}
  <header class="page-header">
    <Breadcrumb @sessionId={{@model.id}} />
    <div class="page-actions">
      <form class="form-inline" {{on "submit" @controller.loadSession}}>
        <PixInput
          placeholder="Identifiant"
          aria-label="Rechercher une session avec un identifiant"
          @type="text"
          @value={{@controller.inputId}}
          {{on "input" @controller.onChangeInputId}}
        />
        <PixButton @size="small" @type="submit">Charger</PixButton>
      </form>
    </div>
  </header>

  <main class="page-body">
    <PixTabs @variant="primary" @ariaLabel="Navigation de la section détails d'une session" class="navigation">
      <LinkTo @route="authenticated.sessions.session.informations" @model={{@model.id}}>
        Informations
      </LinkTo>
      <LinkTo
        @route="authenticated.sessions.session.certifications"
        @model={{@model.id}}
        aria-label="Liste des certifications de la session"
      >
        Certifications
      </LinkTo>
      <LinkTo
        @route="authenticated.sessions.session.candidates"
        @model={{@model.id}}
        aria-label="Liste des inscrits en certif"
      >
        Candidats
      </LinkTo>
    </PixTabs>
    {{outlet}}
  </main>
</template>
