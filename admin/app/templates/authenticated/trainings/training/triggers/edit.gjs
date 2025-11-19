import PixButton from '@1024pix/pix-ui/components/pix-button';
import { on } from '@ember/modifier';
import EditTriggerThreshold from 'pix-admin/components/trainings/edit-trigger-threshold';
<template>
  <form class="form edit-training-trigger" {{on "submit" @controller.onSubmit}}>
    <EditTriggerThreshold
      @title={{@controller.thresholdTitle}}
      @description={{@controller.thresholdDescription}}
      @frameworks={{@controller.model.frameworks}}
      @onChange={{@controller.updateTubes}}
    />

    <ul class="edit-training-trigger__actions">
      <li>
        <PixButton @variant="secondary" @size="large" @triggerAction={{@controller.onCancel}}>
          Annuler
        </PixButton>
      </li>
      <li>
        <PixButton @variant="success" @size="large" @type="submit" @isLoading={{@controller.submitting}}>
          Enregistrer le déclencheur
        </PixButton>
      </li>
    </ul>
  </form>
</template>
