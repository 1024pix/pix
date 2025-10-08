import { action } from '@ember/object';
import Component from '@glimmer/component';
import { eq } from 'ember-truth-helpers';
import CustomDraftElement from 'mon-pix/components/module/element/custom-draft';
import CustomElement from 'mon-pix/components/module/element/custom-element';
import DownloadElement from 'mon-pix/components/module/element/download';
import EmbedElement from 'mon-pix/components/module/element/embed';
import ExpandElement from 'mon-pix/components/module/element/expand';
import FlashcardsElement from 'mon-pix/components/module/element/flashcards/flashcards';
import ImageElement from 'mon-pix/components/module/element/image';
import QabElement from 'mon-pix/components/module/element/qab/qab';
import QcmElement from 'mon-pix/components/module/element/qcm';
import QcuElement from 'mon-pix/components/module/element/qcu';
import QcuDeclarativeElement from 'mon-pix/components/module/element/qcu-declarative';
import QcuDiscoveryElement from 'mon-pix/components/module/element/qcu-discovery';
import QrocmElement from 'mon-pix/components/module/element/qrocm';
import SeparatorElement from 'mon-pix/components/module/element/separator';
import TextElement from 'mon-pix/components/module/element/text';
import VideoElement from 'mon-pix/components/module/element/video';

export const VERIFY_RESPONSE_DELAY = 500;

export default class ModulixElement extends Component {
  @action
  getLastCorrectionForElement() {
    return this.args.getLastCorrectionForElement(this.args.element);
  }

  <template>
    {{#if (eq @element.type "text")}}
      <TextElement @text={{@element}} />
    {{else if (eq @element.type "image")}}
      <ImageElement @image={{@element}} @onAlternativeTextOpen={{@onImageAlternativeTextOpen}} />
    {{else if (eq @element.type "video")}}
      <VideoElement @video={{@element}} @onTranscriptionOpen={{@onVideoTranscriptionOpen}} />
    {{else if (eq @element.type "download")}}
      <DownloadElement @download={{@element}} @onDownload={{@onFileDownload}} />
    {{else if (eq @element.type "embed")}}
      <EmbedElement @embed={{@element}} @passageId={{@passageId}} @onAnswer={{@onElementAnswer}} />
    {{else if (eq @element.type "custom")}}
      <CustomElement @component={{@element}} @onAnswer={{@onElementAnswer}} />
    {{else if (eq @element.type "custom-draft")}}
      <CustomDraftElement @customDraft={{@element}} />
    {{else if (eq @element.type "expand")}}
      <ExpandElement @expand={{@element}} @onExpandToggle={{@onExpandToggle}} />
    {{else if (eq @element.type "separator")}}
      <SeparatorElement />
    {{else if (eq @element.type "flashcards")}}
      <FlashcardsElement @flashcards={{@element}} @onAnswer={{@onElementAnswer}} />
    {{else if (eq @element.type "qcu")}}
      <QcuElement
        @element={{@element}}
        @onAnswer={{@onElementAnswer}}
        @onRetry={{@onElementRetry}}
        @correction={{this.getLastCorrectionForElement @element}}
      />
    {{else if (eq @element.type "qcu-declarative")}}
      <QcuDeclarativeElement @element={{@element}} @onAnswer={{@onElementAnswer}} />
    {{else if (eq @element.type "qcu-discovery")}}
      <QcuDiscoveryElement @element={{@element}} @onAnswer={{@onElementAnswer}} />
    {{else if (eq @element.type "qcm")}}
      <QcmElement
        @element={{@element}}
        @onAnswer={{@onElementAnswer}}
        @onRetry={{@onElementRetry}}
        @correction={{this.getLastCorrectionForElement @element}}
        @updateSkipButton={{@updateSkipButton}}
      />
    {{else if (eq @element.type "qrocm")}}
      <QrocmElement
        @element={{@element}}
        @onAnswer={{@onElementAnswer}}
        @onRetry={{@onElementRetry}}
        @correction={{this.getLastCorrectionForElement @element}}
      />
    {{else if (eq @element.type "qab")}}
      <QabElement @element={{@element}} @onAnswer={{@onElementAnswer}} />
    {{/if}}
  </template>
}
