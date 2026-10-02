import { PixIcon, PixTooltip } from '@1024pix/nebulix-ember';
import { isNone } from '@ember/utils';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class HexagonScore extends Component {
  <template>
    <div class="hexagon-score">
      <div class="hexagon-score__content">
        <div class="hexagon-score-content__title">{{t "common.pix"}}</div>
        <div class="hexagon-score-content__pix-score">{{this.score}}</div>
        <div class="hexagon-score-content__pix-total">1024</div>
        <div class="hexagon-score-content__information">
          <PixTooltip
            @isLight={{true}}
            @isWide={{true}}
            @id="hexagon-score-tooltip"
            @isTriggerElementFocusable={{true}}
          >
            <:triggerElement>
              <span
                tabindex="0"
                class="hexagon-score-content-information__icon"
                aria-describedby="hexagon-score-tooltip"
              >
                <PixIcon @name="info" @plainIcon={{true}} @title={{t "pages.profile.total-score-helper.icon"}} />
              </span>
            </:triggerElement>
            <:tooltip>
              <p class="hexagon-score-information__text">
                <span class="hexagon-score-information__text--strong">
                  {{t "pages.profile.total-score-helper.title"}}
                </span>
                {{t
                  "pages.profile.total-score-helper.explanation"
                  maxReachablePixScore=@maxReachablePixScore
                  maxReachableLevel=@maxReachableLevel
                  htmlSafe=true
                }}
              </p>
            </:tooltip>
          </PixTooltip>
        </div>
      </div>
    </div>
  </template>
  get score() {
    const score = this.args.pixScore;
    return isNone(score) || score === 0 ? '-' : Math.floor(score);
  }
}
