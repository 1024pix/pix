import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixSelect from '@1024pix/pix-ui/components/pix-select';

<template>
  <div class="certification-information-pix-edu">
    <h2 class="certification-information__title">Résultats de la certification complémentaire Pix+ Édu</h2>
    <div class="certification-information-pix-edu__container">
      <div class="certification-information-pix-edu__card">
        <h3>Volet Pix</h3>
        <p>
          {{@certification.complementaryCertificationCourseResultWithExternal.pixResult}}
        </p>
      </div>
      <div class="certification-information-pix-edu__card">
        <h3>Volet jury</h3>
        {{#if @displayJuryLevelSelect}}
          <div class="certification-information-pix-edu__jury-level-editor">
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
            <div>
              <PixButton @variant="secondary" @size="small" @triggerAction={{@onCancelJuryLevelEditButtonClick}}>
                Annuler
              </PixButton>
              <PixButton @size="small" @triggerAction={{@onEditJuryLevelSave}} aria-label="Modifier le niveau du jury">
                Enregistrer
              </PixButton>
            </div>
          </div>
        {{else}}
          <div class="certification-information-pix-edu__jury-level">
            <p>
              {{@certification.complementaryCertificationCourseResultWithExternal.externalResult}}
            </p>
            {{#if @shouldDisplayJuryLevelEditButton}}
              <PixIconButton @ariaLabel="Modifier le volet jury" @triggerAction={{@editJury}} @iconName="edit" />
            {{/if}}
          </div>
        {{/if}}
      </div>
      <div class="certification-information-pix-edu__card">
        <h3>Niveau final</h3>
        <p>{{@certification.complementaryCertificationCourseResultWithExternal.finalResult}}</p>
      </div>
    </div>
  </div>
</template>
