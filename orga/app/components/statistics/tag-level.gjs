import PixTag from '@1024pix/pix-ui/components/pix-tag';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import { ADVANCED_LEVEL, INDEPENDENT_LEVEL, NOVICE_LEVEL } from '../../helpers/levels-info';

export default class TagLevel extends Component {
  get category() {
    const parsedLevel = Number(this.args.level);

    const intlKey = 'pages.statistics.level.';
    if (parsedLevel < NOVICE_LEVEL) return intlKey + 'novice';
    if (parsedLevel < INDEPENDENT_LEVEL) return intlKey + 'independent';
    if (parsedLevel < ADVANCED_LEVEL) return intlKey + 'advanced';
    return intlKey + 'expert';
  }

  <template>
    <PixTag>{{t this.category}}</PixTag>
  </template>
}
