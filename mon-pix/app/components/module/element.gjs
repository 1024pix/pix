import { action } from '@ember/object';
import Component from '@glimmer/component';
import { eq } from 'ember-truth-helpers';
import DownloadElement from 'mon-pix/components/module/element/download';
import EmbedElement from 'mon-pix/components/module/element/embed';
import FlashcardsElement from 'mon-pix/components/module/element/flashcards';
import ImageElement from 'mon-pix/components/module/element/image';
import QcmElement from 'mon-pix/components/module/element/qcm';
import QcuElement from 'mon-pix/components/module/element/qcu';
import QrocmElement from 'mon-pix/components/module/element/qrocm';
import SeparatorElement from 'mon-pix/components/module/element/separator';
import TextElement from 'mon-pix/components/module/element/text';
import VideoElement from 'mon-pix/components/module/element/video';

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
      <VideoElement @video={{@element}} @onTranscriptionOpen={{@onVideoTranscriptionOpen}} @onPlay={{@onVideoPlay}} />
    {{else if (eq @element.type "download")}}
      <DownloadElement @download={{@element}} @onDownload={{@onFileDownload}} />
    {{else if (eq @element.type "embed")}}
      <EmbedElement @embed={{@element}} @onAnswer={{@onElementAnswer}} />
    {{else if (eq @element.type "separator")}}
      <SeparatorElement />
    {{else if (eq @element.type "flashcards")}}
      <FlashcardsElement @flashcards={{@element}} />
    {{else if (eq @element.type "qcu")}}
      <QcuElement
        @element={{@element}}
        @onAnswer={{@onElementAnswer}}
        @onRetry={{@onElementRetry}}
        @correction={{this.getLastCorrectionForElement @element}}
      />
    {{else if (eq @element.type "qcm")}}
      <QcmElement
        @element={{@element}}
        @onAnswer={{@onElementAnswer}}
        @onRetry={{@onElementRetry}}
        @correction={{this.getLastCorrectionForElement @element}}
      />
    {{else if (eq @element.type "qrocm")}}
      <QrocmElement
        @element={{@element}}
        @onAnswer={{@onElementAnswer}}
        @onRetry={{@onElementRetry}}
        @correction={{this.getLastCorrectionForElement @element}}
      />
    {{/if}}
  </template>
}
