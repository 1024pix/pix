import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
<template>
  {{! template-lint-disable require-input-label }}
  {{pageTitle (t "pages.certifications.title")}}
  <div class="page">
    <header>
      <h1>
        {{t "pages.certifications.title"}}
      </h1>
      <form class="page-actions" {{on "submit" @controller.loadCertification}}>
        <PixInput
          placeholder="Identifiant"
          aria-label="Rechercher une session avec un identifiant"
          @type="text"
          @value={{@controller.inputId}}
          {{on "input" @controller.onChangeInputId}}
        />
        <PixButton @size="small" @type="submit">{{t "pages.certifications.actions.load.label"}}</PixButton>
      </form>
    </header>

    <main class="page-body">
      {{outlet}}
    </main>
  </div>
</template>
