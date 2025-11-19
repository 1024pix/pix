import Stage from 'pix-admin/components/stages/stage';
<template>
  <Stage
    @stage={{@model.stage}}
    @targetProfileName={{@model.targetProfile.internalName}}
    @availableLevels={{@controller.availableLevels}}
    @unavailableThresholds={{@controller.unavailableThresholds}}
    @hasLinkedCampaign={{@controller.hasLinkedCampaign}}
    @toggleEditMode={{@controller.toggleEditMode}}
    @isEditMode={{@controller.isEditMode}}
    @onUpdate={{@controller.update}}
  />
</template>
