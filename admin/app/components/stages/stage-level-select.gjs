import PixSelect from '@1024pix/pix-ui/components/pix-select';
import Component from '@glimmer/component';

export default class StageLevelSelect extends Component {
  get levelOptions() {
    return this.args.availableLevels.map((level) => ({
      value: level.toString(),
      label: level.toString(),
    }));
  }

  <template>
    <PixSelect
      ...attributes
      @options={{this.levelOptions}}
      @onChange={{@onChange}}
      @value={{@value}}
      @id={{@id}}
      @isDisabled={{@isDisabled}}
      @screenReaderOnly={{true}}
      @hideDefaultOption={{true}}
    >
      <:label>{{@label}}</:label>
    </PixSelect>
  </template>
}
