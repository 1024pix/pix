import { PixSelect } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class SelectFilter extends Component {
  @action
  onChange(value) {
    const { triggerFiltering, field } = this.args;
    triggerFiltering(field, value);
  }

  <template>
    <PixSelect
      @screenReaderOnly={{true}}
      @onChange={{this.onChange}}
      @options={{@options}}
      @value={{@selectedOption}}
      @placeholder={{@emptyOptionLabel}}
    >
      <:label>{{@label}}</:label>
    </PixSelect>
  </template>
}
