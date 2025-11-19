import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { on } from '@ember/modifier';
import MembershipsSection from 'pix-admin/components/certification-centers/memberships-section';
<template>
  {{#unless @model.isCertificationCenterArchived}}
    <section class="page-section">
      <header class="page-section__header">
        <h2 class="page-section__title">Ajouter un membre</h2>
      </header>

      <div class="certification-center__section">
        <PixInput
          id="userEmailToAdd"
          type="email"
          @value={{@controller.userEmailToAdd}}
          aria-label="Adresse e-mail du nouveau membre"
          class="form-field__text form-control"
          placeholder="membre@inviter.net"
          {{on "input" @controller.onChangeUserEmail}}
          {{on "focusout" @controller.updateEmailErrorMessage}}
        />

        <PixButton
          @triggerAction={{@controller.addCertificationCenterMembership}}
          @isDisabled={{@controller.isDisabled}}
          @size="small"
          aria-label="Ajouter le membre"
        >
          Valider
        </PixButton>
      </div>
      {{#if @controller.errorMessage}}
        <div class="certification-center__section error">
          {{@controller.errorMessage}}
        </div>
      {{/if}}
    </section>

    <MembershipsSection
      @certificationCenterMemberships={{@model.certificationCenterMemberships}}
      @disableCertificationCenterMembership={{@controller.disableCertificationCenterMembership}}
      @onCertificationCenterMembershipRoleChange={{@controller.updateCertificationCenterMembershipRole}}
    />
  {{/unless}}
</template>
