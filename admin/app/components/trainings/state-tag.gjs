import PixTag from '@1024pix/pix-ui/components/pix-tag';
import Component from '@glimmer/component';

export default class StateTag extends Component {
  get color() {
    if (this.args.isDisabled === true) {
      return 'error';
    } else {
      return 'primary';
    }
  }

  get content() {
    if (this.args.isDisabled === true) {
      return 'En pause';
    } else {
      return 'Actif';
    }
  }

  <template>
    <PixTag @color={{this.color}}>{{this.content}}</PixTag>
  </template>
}
