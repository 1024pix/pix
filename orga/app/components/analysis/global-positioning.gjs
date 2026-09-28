import { PixBlock, PixGauge } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class GlobalPositioning extends Component {
  @service intl;

  <template>
    <PixBlock class="global-positioning" @variant="orga">
      <h2 class="global-positioning__title">{{t "components.global-positioning.title"}}</h2>
      <p class="global-positioning__description">{{t "components.global-positioning.description"}}</p>
      <PixGauge
        @isSmall={{false}}
        @maxLevel={{@data.maxReachableLevel}}
        @reachedLevel={{@data.meanReachedLevel}}
        @label={{t
          "components.global-positioning.gauge-label"
          reachedLevel=@data.meanReachedLevel
          maxLevel=@data.maxReachableLevel
        }}
      />
    </PixBlock>
  </template>
}
