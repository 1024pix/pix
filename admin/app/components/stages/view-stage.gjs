import PixButton from '@1024pix/pix-ui/components/pix-button';
import { t } from 'ember-intl';

<template>
  <section class="page-section">
    <div class="page-section__header">
      <h1 class="page-section__title">{{@stage.name}}</h1>
    </div>
    <div class="page-section__details">
      <ul class="stage-data__list">
        <li>ID : {{@stage.id}}</li>
        <li>
          {{#if @stage.isFirstSkill}}
            1er acquis
          {{else}}
            {{@stageTypeName}}
            :
            {{#if @isTypeLevel}}
              {{@stage.level}}
            {{else}}
              {{@stage.threshold}}
            {{/if}}
          {{/if}}
        </li>
        <li>Titre : {{@stage.title}}</li>
        <li>Message : {{@stage.message}}</li>
        <li>Titre pour le prescripteur : {{@stage.prescriberTitle}}</li>
        <li>Description pour le prescripteur : {{@stage.prescriberDescription}}</li>
      </ul>
    </div>
    <br />
    <PixButton @size="small" @variant="secondary" @triggerAction={{@toggleEditMode}}>
      {{t "common.actions.edit"}}
    </PixButton>
  </section>
</template>
