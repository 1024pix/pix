import { PixTag } from '@1024pix/nebulix-ember';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import { categories } from '../../helpers/target-profile-categories';

export default class Category extends Component {
  get category() {
    const { category } = this.args;
    return categories[category];
  }

  <template>
    <PixTag @color="blue-light">
      {{t this.category}}
    </PixTag>
  </template>
}
