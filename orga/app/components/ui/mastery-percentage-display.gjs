import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixStars from '@1024pix/pix-ui/components/pix-stars';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class MasteryPercentageDisplay extends Component {
  get totalStages() {
    return this.args.hasStages ? this.args.totalStage - 1 : null;
  }

  get reachedStage() {
    return this.args.hasStages ? this.args.reachedStage - 1 : null;
  }

  get displayTooltip() {
    return this.args.prescriberDescription || this.args.prescriberTitle;
  }

  <template>
    <span
      aria-hidden={{if @hasStages "true" "false"}}
      class="mastery-percentage-display {{if @isTableDisplay 'mastery-percentage-display--table-display'}}"
    >
      <span class="mastery-percentage-display__percentage">{{t "common.result.percentage" value=@masteryRate}}</span>
      {{#if @hasStages}}
        <PixStars
          @count={{this.reachedStage}}
          @total={{this.totalStages}}
          @alt={{t "common.result.stages" count=this.reachedStage total=this.totalStages}}
          class="mastery-percentage-display__stars
            {{if @isTableDisplay 'mastery-percentage-display__stars--table-display'}}"
          @color="blue"
        />
        {{#if this.displayTooltip}}
          <PixTooltip
            @id="stage-tooltip-{{this.reachedStage}}"
            @position="bottom-left"
            @isWide={{true}}
            class="hide-on-mobile"
          >
            <:triggerElement>
              <PixIcon
                @name="info"
                @plainIcon={{true}}
                class="mastery-percentage-display__info-icon"
                tabindex="0"
                aria-describedby="stage-tooltip-{{this.reachedStage}}"
              />
            </:triggerElement>
            <:tooltip>
              <strong>{{@prescriberTitle}}</strong>
              <p>{{@prescriberDescription}}</p>
            </:tooltip>
          </PixTooltip>
        {{/if}}
      {{/if}}
    </span>
    {{#if @hasStages}}
      <span class="screen-reader-only">
        {{t
          "common.result.accessibility-description"
          percentage=@masteryRate
          stage=this.reachedStage
          totalStage=this.totalStages
        }}
      </span>
    {{/if}}
  </template>
}
