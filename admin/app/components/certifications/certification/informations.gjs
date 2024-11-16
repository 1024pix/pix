import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';

import ConfirmPopup from '../../confirm-popup';
import CandidateEditModal from '../candidate-edit-modal';
import CertificationCompetenceList from '../competence-list';
import CertificationInfoField from '../info-field';
import CertificationInfoTag from '../info-tag';
import CertificationIssueReports from '../issue-reports';
import CertificationComments from './comments';

<template>
  <div class="certification-informations">
    <div class="certification-informations__row">
      <PixButtonLink @route="authenticated.users.get" @size="small" @model={{@certification.userId}}>
        Voir les détails de l'utilisateur
      </PixButtonLink>
      {{#if @certification.isCancelled}}
        <PixButton @variant="error" @size="small" @triggerAction={{@onUncancelCertificationButtonClick}}>
          Désannuler la certification
        </PixButton>
      {{else}}
        <span class="certification-informations__row__actions">
          <PixButton @variant="secondary" @size="small" @triggerAction={{@onCancelCertificationButtonClick}}>
            Annuler la certification
          </PixButton>

          {{#if @shouldDisplayUnrejectCertificationButton}}
            <PixButton @variant="error" @size="small" @triggerAction={{@onUnrejectCertificationButtonClick}}>
              Annuler le rejet
            </PixButton>
          {{/if}}

          {{#if @shouldDisplayRejectCertificationButton}}
            {{#if @certification.isPublished}}
              <PixTooltip @position="left" @isWide={{true}}>
                <:triggerElement>
                  <PixButton
                    @variant="error"
                    @size="small"
                    @triggerAction={{@onRejectCertificationButtonClick}}
                    @isDisabled={{true}}
                  >
                    Rejeter la certification
                  </PixButton>
                </:triggerElement>

                <:tooltip>Vous ne pouvez pas rejeter une certification publiée. Merci de dépublier la session avant de
                  rejeter cette certification.
                </:tooltip>
              </PixTooltip>
            {{else}}
              <PixButton @variant="error" @size="small" @triggerAction={{@onRejectCertificationButtonClick}}>
                Rejeter la certification
              </PixButton>
            {{/if}}
          {{/if}}
        </span>
      {{/if}}
    </div>

    <div class="certification-informations__row">
      <div class="certification-informations__card">
        <h2 class="certification-informations__card__title">
          <CertificationInfoTag @record={{@certification}} @float={{true}} />
          État
        </h2>
        <CertificationInfoField
          @value={{@certification.sessionId}}
          @edition={{false}}
          @label="Session :"
          @linkRoute="authenticated.sessions.session"
        />
        <CertificationInfoField
          @value={{@certification.statusLabelAndValue.label}}
          @edition={{false}}
          @label="Statut :"
        />
        <CertificationInfoField @value={{@certification.creationDate}} @edition={{false}} @label="Créée le :" />
        <CertificationInfoField @value={{@certification.completionDate}} @edition={{false}} @label="Terminée le :" />
        <CertificationInfoField @value={{@certification.publishedText}} @edition={{false}} @label="Publiée :" />
      </div>

      <div class="certification-informations__card {{if @editingCandidateInformations 'border-primary'}}">
        <h2 class="certification-informations__card__title">Candidat</h2>
        <div class="certification-info-field">
          <span>Prénom :</span>
          <span>{{@certification.firstName}}</span>
        </div>
        <div class="certification-info-field">
          <span>Nom de famille :</span>
          <span>{{@certification.lastName}}</span>
        </div>
        <div class="certification-info-field">
          <span>Date de naissance :</span>
          <span>{{dayjsFormat @certification.birthdate "DD/MM/YYYY" allow-empty=true}}</span>
        </div>
        <div class="certification-info-field">
          <span>Sexe :</span>
          <span>{{@certification.sex}}</span>
        </div>
        <div class="certification-info-field">
          <span>Commune de naissance :</span>
          <span>{{@certification.birthplace}}</span>
        </div>
        <div class="certification-info-field">
          <span>Code postal de naissance :</span>
          <span>{{@certification.birthPostalCode}}</span>
        </div>
        <div class="certification-info-field">
          <span>Code INSEE de naissance :</span>
          <span>{{@certification.birthInseeCode}}</span>
        </div>
        <div class="certification-info-field">
          <span>Pays de naissance :</span>
          <span>{{@certification.birthCountry}}</span>
        </div>

        <div class="candidate-informations__actions">
          <PixButton
            @size="small"
            @triggerAction={{@openCandidateEditModal}}
            aria-label="Modifier les informations du candidat"
          >
            Modifier infos candidat
          </PixButton>
        </div>
      </div>
    </div>

    {{#if @certification.hasComplementaryCertifications}}
      <div class="certification-informations__row">
        <div class="certification-informations__card">
          <h2 class="certification-informations__card__title">Certification complémentaire</h2>

          {{#if @certification.commonComplementaryCertificationCourseResult}}
            <ul class="certification-informations__card__list">
              <li class="certification-informations__card__list-item">
                <span class="certification-informations__card__list-label">
                  {{@certification.commonComplementaryCertificationCourseResult.label}}
                  :
                </span>
                {{@certification.commonComplementaryCertificationCourseResult.status}}
              </li>
            </ul>
          {{/if}}

          {{#if @certification.complementaryCertificationCourseResultWithExternal}}
            <section class="certification-informations__pix-edu">
              <h2 class="certification-informations__pix-edu__title">Résultats de la certification complémentaire Pix+
                Edu :</h2>
              <div class="certification-informations__row">
                <div class="certification-informations__card certification-informations__card--pix-edu">
                  <p>VOLET PIX</p>
                  <p class="certification-informations__card__score">
                    {{@certification.complementaryCertificationCourseResultWithExternal.pixResult}}
                  </p>
                </div>
                <div class="certification-informations__card certification-informations__card--pix-edu">
                  <p>VOLET JURY</p>
                  {{#if @displayJuryLevelSelect}}
                    <div class="certification-informations__pix-edu__row__jury-level-editor">
                      <section>
                        <PixSelect
                          @screenReaderOnly={{true}}
                          @options={{@juryLevelOptions}}
                          @value={{@selectedJuryLevel}}
                          @hideDefaultOption={{true}}
                          @onChange={{@selectJuryLevel}}
                          @placeholder="Choisir un niveau"
                        >
                          <:label>Sélectionner un niveau</:label>
                        </PixSelect>
                      </section>
                      <section>
                        <PixButton
                          @variant="secondary"
                          @size="small"
                          @triggerAction={{@onCancelJuryLevelEditButtonClick}}
                        >
                          Annuler
                        </PixButton>
                        <PixButton
                          @size="small"
                          @triggerAction={{@onEditJuryLevelSave}}
                          aria-label="Modifier le niveau du jury"
                        >
                          Enregistrer
                        </PixButton>
                      </section>
                    </div>
                  {{else}}
                    <div class="certification-informations__pix-edu__row__jury-level">
                      <p class="certification-informations__card__score">
                        {{@certification.complementaryCertificationCourseResultWithExternal.externalResult}}
                      </p>
                      {{#if @shouldDisplayJuryLevelEditButton}}
                        <PixIconButton
                          class="jury-level-edit-icon-button"
                          @ariaLabel="Modifier le volet jury"
                          @triggerAction={{@editJury}}
                          @iconName="edit"
                        />
                      {{/if}}
                    </div>
                  {{/if}}
                </div>
                <div class="certification-informations__card certification-informations__card--pix-edu">
                  <p>NIVEAU FINAL</p>
                  <p
                    class="certification-informations__card__score"
                  >{{@certification.complementaryCertificationCourseResultWithExternal.finalResult}}</p>
                </div>
              </div>
            </section>
          {{/if}}
        </div>
      </div>
    {{/if}}

    {{#if @hasIssueReports}}
      <section
        class="certification-informations__row certification-informations__card certification-informations__certification-issue-reports"
      >
        <h2 class="card-title certification-informations__card__title">Signalements</h2>
        <CertificationIssueReports
          @hasImpactfulIssueReports={{@hasImpactfulIssueReports}}
          @hasUnimpactfulIssueReports={{@hasUnimpactfulIssueReports}}
          @impactfulCertificationIssueReports={{@impactfulCertificationIssueReports}}
          @unimpactfulCertificationIssueReports={{@unimpactfulCertificationIssueReports}}
          @resolveIssueReport={{@resolveIssueReport}}
        />
      </section>
    {{/if}}

    <CertificationComments @onJuryCommentSave={{@onJuryCommentSave}} @certification={{@certification}} />

    <div class="certification-informations__row">
      <div class="certification-informations__card">
        <h2 class="certification-informations__card__title">Résultats</h2>
        <CertificationInfoField
          @value={{@certification.pixScore}}
          @edition={{false}}
          @label="Score :"
          @fieldId="certification-pixScore"
          @suffix=" Pix"
        />

        <CertificationCompetenceList
          @competences={{@certification.competences}}
          @shouldDisplayPixScore={{@shouldDisplayPixScore}}
          @edition={{false}}
          @onUpdateScore={{@onUpdateScore}}
          @onUpdateLevel={{@onUpdateLevel}}
        />
      </div>
    </div>
  </div>

  <ConfirmPopup
    @title={{@modalTitle}}
    @message={{@confirmMessage}}
    @error={{@confirmErrorMessage}}
    @confirm={{@confirmAction}}
    @show={{@displayConfirm}}
    @cancel={{@onCancelConfirm}}
  />

  {{#if @isCandidateEditModalOpen}}
    <CandidateEditModal
      @onCancelButtonsClicked={{@closeCandidateEditModal}}
      @onFormSubmit={{@onCandidateInformationSave}}
      @candidate={{@certification}}
      @countries={{@countries}}
      @isDisplayed={{@isCandidateEditModalOpen}}
    />
  {{/if}}
</template>
