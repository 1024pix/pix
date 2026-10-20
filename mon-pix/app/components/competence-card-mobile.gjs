import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import CircleChart from 'mon-pix/components/circle-chart';
import scorecardAriaLabel from 'mon-pix/helpers/scorecard-aria-label';

export default class CompetenceCardMobile extends Component {
  <template>
    <article class="competence-card {{if @interactive 'competence-card--interactive'}}" role="article">
      <LinkTo
        @route="authenticated.competences.details"
        @model={{@scorecard.competenceId}}
        class="competence-card__link"
      >
        <span class="competence-card__wrapper competence-card__wrapper--{{@scorecard.area.color}}"></span>
        <div class="competence-card__title">
          <span class="competence-card__area-name">{{@scorecard.area.title}}</span>
          <h4 class="competence-card__competence-name">{{@scorecard.name}}</h4>
        </div>
        <div class="competence-card__body" role="img" aria-label="{{scorecardAriaLabel @scorecard}}">
          {{#if @scorecard.isFinishedWithMaxLevel}}
            <div class="competence-card__congrats competence-card__congrats--small">
              <span class="score-label competence-card__score-label competence-card__score-label--congrats">{{t
                  "common.level"
                }}</span>
              <span
                class="score-value competence-card__score-value competence-card__score-value--congrats"
              >{{this.displayedLevel}}</span>
            </div>
          {{else}}
            <div class="competence-card__body--white-background">
              <CircleChart
                @value={{@scorecard.capedPercentageAheadOfNextLevel}}
                @sliceColor={{@scorecard.area.color}}
                @chartClass="circle-chart--small"
                @thicknessClass="circle--thick"
                role="presentation"
              >
                <div class="competence-card__level">
                  <span class="score-label competence-card__score-label">{{t "common.level"}}</span>
                  <span class="score-value competence-card__score-value">{{this.displayedLevel}}</span>
                </div>
              </CircleChart>
            </div>
          {{/if}}
        </div>
      </LinkTo>
    </article>
  </template>
  get displayedLevel() {
    const { isNotStarted, level } = this.args.scorecard;
    if (isNotStarted || level === 0) {
      return '-';
    }
    return level;
  }
}
