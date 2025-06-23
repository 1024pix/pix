import { guidFor } from '@ember/object/internals';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import { formatNumber, t } from 'ember-intl';

import { MAX_REACHABLE_LEVEL } from '../../helpers/levels-info';

export default class CoverRateGauge extends Component {
  get id() {
    return guidFor(this);
  }

  get translation() {
    return this.args.label || 'components.cover-rate-gauge.label';
  }

  getGaugeSizeStyle = (level, { withExtraPercentage }) => {
    const gaugeSize = (level / MAX_REACHABLE_LEVEL) * 100;
    return htmlSafe(`width: calc(${gaugeSize}% + ${withExtraPercentage ? 5 : 0}%)`);
  };

  <template>
    <div class="cover-rate-gauge">
      <div class="cover-rate-gauge__container">
        <div
          aria-hidden="true"
          class="cover-rate-gauge__level cover-rate-gauge__level--tube-level"
          style={{this.getGaugeSizeStyle @tubeLevel withExtraPercentage=true}}
        >
          {{formatNumber @tubeLevel}}
        </div>
        <div class="cover-rate-gauge__background {{if @hideMaxMin ' cover-rate-gauge__background--hide-max-min'}}">

          <label for={{this.id}} class="screen-reader-only">
            {{t this.translation reachedLevel=@userLevel maxLevel=@tubeLevel}}
          </label>

          <progress
            aria-hidden="true"
            class="cover-rate-gauge__progress"
            id={{this.id}}
            max={{@tubeLevel}}
            value={{@userLevel}}
            style={{this.getGaugeSizeStyle @tubeLevel withExtraPercentage=false}}
          >
            {{formatNumber @userLevel}}
          </progress>
        </div>
        <div
          aria-hidden="true"
          class="cover-rate-gauge__level cover-rate-gauge__level--user-level"
          style={{this.getGaugeSizeStyle @userLevel withExtraPercentage=true}}
        >
          {{formatNumber @userLevel}}
        </div>
      </div>
    </div>
  </template>
}
