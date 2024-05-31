import Component from '@glimmer/component';
import Element from 'mon-pix/components/module/element';

export default class ModulixStep extends Component {
  get elements() {
    return this.args.step.elements;
  }

  <template>
    {{#each this.elements as |element|}}
      <div class="grain-card-content__element">
        <Element
          @element={{element}}
          @submitAnswer={{@submitAnswer}}
          @retryElement={{@retryElement}}
          @getLastCorrectionForElement={{@getLastCorrectionForElement}}
        />
      </div>
    {{/each}}
  </template>
}
