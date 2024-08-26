import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import { t } from 'ember-intl';

<template>
  <section class="page-section organization-team-section">
    <div class="organization__forms-section">
      <form>
        <h2>Ajouter un membre</h2>
        <div class="organization__sub-form">
          <PixInput
            @id="userEmailToAdd"
            value={{@userEmailToAdd}}
            {{on "change" @onChangeUserEmailToAdd}}
            class="organization-team-section__input"
          >
            <:label>Adresse e-mail de l'utilisateur à ajouter</:label>
          </PixInput>
          <PixButton
            @size="small"
            @triggerAction={{@addOrganizationMembership}}
            class="organization-team-section__button"
            aria-label="Ajouter un membre"
          >
            {{t "common.actions.validate"}}
          </PixButton>
        </div>
      </form>
    </div>
  </section>
</template>
