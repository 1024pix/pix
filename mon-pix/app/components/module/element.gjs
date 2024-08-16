import { action } from '@ember/object';
import Component from '@glimmer/component';
import { eq } from 'ember-truth-helpers';
import DownloadElement from 'mon-pix/components/module/element/download';
import EmbedElement from 'mon-pix/components/module/element/embed';
import ImageElement from 'mon-pix/components/module/element/image';
import QcmElement from 'mon-pix/components/module/element/qcm';
import QcuElement from 'mon-pix/components/module/element/qcu';
import QrocmElement from 'mon-pix/components/module/element/qrocm';
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
      <ImageElement @image={{@element}} @openAlternativeText={{@openImageAlternativeText}} />
    {{else if (eq @element.type "video")}}
      <VideoElement
        @video={{@element}}
        @openTranscription={{@openVideoTranscription}}
        @clickOnPlayButton={{@clickOnPlayButton}}
      />
    {{else if (eq @element.type "download")}}
      <DownloadElement @download={{@element}} @onFileDownload={{@onFileDownload}} />
    {{else if (eq @element.type "embed")}}
      <EmbedElement @embed={{@element}} @submitAnswer={{@submitAnswer}} />
    {{else if (eq @element.type "qcu")}}
      <QcuElement
        @element={{@element}}
        @submitAnswer={{@submitAnswer}}
        @retryElement={{@retryElement}}
        @correction={{this.getLastCorrectionForElement @element}}
      />
    {{else if (eq @element.type "qcm")}}
      <QcmElement
        @element={{@element}}
        @submitAnswer={{@submitAnswer}}
        @retryElement={{@retryElement}}
        @correction={{this.getLastCorrectionForElement @element}}
      />
    {{else if (eq @element.type "qrocm")}}
      <QrocmElement
        @element={{@element}}
        @submitAnswer={{@submitAnswer}}
        @retryElement={{@retryElement}}
        @correction={{this.getLastCorrectionForElement @element}}
      />
    {{/if}}
  </template>
}
