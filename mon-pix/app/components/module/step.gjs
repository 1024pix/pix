import Component from '@glimmer/component';
import { eq } from 'ember-truth-helpers';
import TextElement from 'mon-pix/components/module/text';

export default class ModulixStep extends Component {
  get elements() {
    return this.args.step.elements;
  }

  <template>
    {{#each this.elements as |element|}}
      <div class="grain-card-content__element">
        {{#if (eq element.type "text")}}
          <TextElement @text={{element}} />
        {{/if}}
      </div>
    {{/each}}
  </template>
}
