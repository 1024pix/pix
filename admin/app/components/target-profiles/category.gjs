import { PixTag } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';

import { categories } from '../../models/target-profile';

export default class Category extends Component {
  get category() {
    const { category } = this.args;
    return categories[category];
  }

  <template>
    <PixTag @color="blue-light">
      {{this.category}}
    </PixTag>
  </template>
}
