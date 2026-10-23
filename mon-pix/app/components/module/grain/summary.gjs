import { PixBlock } from '@1024pix/nebulix-ember';
import GrainContent from 'mon-pix/components/module/grain/grain-content';

<template>
  <div class="grain-summary">
    <span class="grain-summary__decoration"></span>
    <PixBlock class="grain-summary__block">
      <img src="/images/modulix/megaphone.png" class="grain-summary__image" alt="" />

      <GrainContent
        @grain={{@grain}}
        @passage={{@passage}}
        @onElementAnswer={{@onElementAnswer}}
        @onElementRetry={{@onElementRetry}}
        @getLastCorrectionForElement={{@getLastCorrectionForElement}}
        @stepperIsFinished={{@stepperIsFinished}}
        @updateSkipButton={{@updateSkipButton}}
        @onStepperNextStep={{@onStepperNextStep}}
        @onImageAlternativeTextOpen={{@onImageAlternativeTextOpen}}
        @onVideoTranscriptionOpen={{@onVideoTranscriptionOpen}}
        @onFileDownload={{@onFileDownload}}
        @onExpandToggle={{@onExpandToggle}}
      />
    </PixBlock>
  </div>
</template>
