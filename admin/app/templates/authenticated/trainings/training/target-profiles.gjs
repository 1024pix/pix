import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
<template>
  <div class="training-target-profiles">
    {{#if @controller.canAttachTargetProfiles}}
      <section class="page-section">
        <header class="header page-section__header">
          <h2 class="page-section__title">Rattacher un ou plusieurs profil(s) cible(s)</h2>
        </header>
        <div>
          <form class="training__sub-form form" {{on "submit" @controller.attachTargetProfiles}}>
            <PixInput
              @value={{@controller.targetProfilesToAttach}}
              @screenReaderOnly={{true}}
              class="training-sub-form__input form-field__text form-control"
              placeholder="1, 2"
              {{on "input" @controller.onChangeTargetProfilesToAttach}}
            >
              <:label>ID du ou des profil(s) cible(s)</:label>
            </PixInput>
            <PixButton
              @type="submit"
              @size="small"
              @isDisabled={{@controller.noTargetProfilesToAttach}}
            >Valider</PixButton>
          </form>
        </div>
      </section>
    {{/if}}

    <section class="page-section">
      <header class="header page-section__header">
        <h2 id="page-section-title" class="page-section__title">{{t
            "pages.trainings.training.targetProfiles.tabName"
          }}</h2>
      </header>
      {{#if @model.targetProfileSummaries}}
        <PixTable
          @variant="admin"
          @data={{@model.training.sortedTargetProfileSummaries}}
          @caption="Profil cible associé au contenu"
          class="training-target-profiles-table"
        >
          <:columns as |row context|>
            <PixTableColumn @context={{context}} class="table__column--wide">
              <:header>
                ID
              </:header>
              <:cell>
                {{row.id}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}} class="table__column--wide">
              <:header>
                Nom interne du profil cible
              </:header>
              <:cell>
                <LinkTo @route="authenticated.target-profiles.target-profile" @model={{row.id}}>
                  {{row.internalName}}
                </LinkTo>
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}} class="table__column--wide">
              <:header>
                Statut
              </:header>
              <:cell>
                {{if row.outdated "Obsolète" "Actif"}}
              </:cell>
            </PixTableColumn>
            <PixTableColumn @context={{context}} class="table__column--wide">
              <:header>
                Actions
              </:header>
              <:cell>
                <div class="training-target-profiles-table__actions">
                  <PixButton
                    @variant="error"
                    @iconBefore="delete"
                    @triggerAction={{fn @controller.onClickDetachTargetProfile row}}
                  >
                    Détacher
                  </PixButton>
                </div>
              </:cell>
            </PixTableColumn>
          </:columns>
        </PixTable>
      {{else}}
        <div class="table__empty">Aucun profil cible associé à ce contenu formatif</div>
      {{/if}}
    </section>
  </div>

  <PixModal
    @title={{t "pages.trainings.training.targetProfiles.detach-title"}}
    @onCloseButtonClick={{@controller.closeModal}}
    @showModal={{@controller.showModal}}
  >
    <:content>
      <p>
        {{t
          "pages.trainings.training.targetProfiles.detach-modal"
          htmlSafe=true
          name=@controller.targetProfileToDetach.internalName
        }}
      </p>
    </:content>
    <:footer>
      <PixButton @variant="secondary" @triggerAction={{@controller.closeModal}}>
        {{t "common.actions.cancel"}}
      </PixButton>
      <PixButton
        @variant="error"
        @triggerAction={{fn @controller.detachTargetProfile @controller.targetProfileToDetach}}
      >{{t "common.actions.confirm"}}</PixButton>
    </:footer>
  </PixModal>
</template>
