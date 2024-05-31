import Component from '@glimmer/component';
import { eq } from 'ember-truth-helpers';
import ImageElement from 'mon-pix/components/module/image';
import QcuElement from 'mon-pix/components/module/qcu';
import TextElement from 'mon-pix/components/module/text';
import VideoElement from 'mon-pix/components/module/video';

export default class ModulixStep extends Component {
  get elements() {
    return this.args.step.elements;
  }

  <template>
    {{#each this.elements as |element|}}
      <div class="grain-card-content__element">
        {{#if (eq element.type "text")}}
          <TextElement @text={{element}} />
        {{else if (eq element.type "image")}}
          <ImageElement @image={{element}} @moduleId={{@grain.module.id}} />
        {{else if (eq element.type "video")}}
          <VideoElement @video={{element}} @moduleId={{@grain.module.id}} />
        {{else if (eq element.type "qcu")}}
          <QcuElement
            @element={{element}}
            @submitAnswer={{@submitAnswer}}
            @retryElement={{@retryElement}}
            @correction={{this.getLastCorrectionForElement element}}
          />
        {{/if}}
      </div>
    {{/each}}
  </template>
}
