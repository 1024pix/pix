import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjsDurationHumanize from 'ember-dayjs/helpers/dayjs-duration-humanize';
import { t } from 'ember-intl';
import { gt, not } from 'ember-truth-helpers';

import Chevron from '../../ui/chevron';
import RecommendationIndicator from './recommendation-indicator';
import TutorialCounter from './tutorial-counter';

export default class TubeRecommendationRowComponent extends Component {
  @tracked
  isOpen = false;

  @action
  toggleTutorialsSection() {
    this.isOpen = !this.isOpen;
  }
  <template>
    <tr aria-label="{{t 'pages.campaign-review.table.analysis.row-title'}}">
      <td class="competences-col__name">
        <div class="competences-col-name-wrapper">
          <span
            class="competences-col__border
              {{if this.isOpen ' competences-col__border--top'}}
              competences-col__border--{{@tubeRecommendation.areaColor}}"
          ></span>
          <span class="tube-recommendation-title {{if this.isOpen ' tube-recommendation-title--open'}}">
            {{@tubeRecommendation.tubePracticalTitle}}<br />
            <sub class="tube-recommendation-subtitle {{if this.isOpen ' tube-recommendation-subtitle--open'}}">
              {{@tubeRecommendation.competenceName}}
            </sub>
          </span>
        </div>
      </td>
      <td>
        <RecommendationIndicator @value={{@tubeRecommendation.averageScore}} />
      </td>
      <td>
        <TutorialCounter @tutorials={{@tubeRecommendation.tutorials}} />
      </td>
      <td class="table__column--right">
        {{#if (gt @tubeRecommendation.tutorials.length 0)}}
          <Chevron
            @isOpen={{this.isOpen}}
            @onClick={{this.toggleTutorialsSection}}
            @ariaLabel={{t "pages.campaign-review.table.analysis.column.tutorial.aria-label"}}
          />
        {{/if}}
      </td>
    </tr>
    <tr
      class="tube-recommendation-tutorial {{if this.isOpen ' tube-recommendation-tutorial--open'}}"
      aria-hidden="{{not this.isOpen}}"
    >
      <td colspan="4" class="tube-recommendation-tutorial__column">
        <div
          class="tube-recommendation-tutorial-wrapper {{if this.isOpen ' tube-recommendation-tutorial-wrapper--open'}}"
        >
          <span
            class="competences-col__border competences-col__border--bottom
              {{if this.isOpen ' competences-col__border--open'}}
              competences-col__border--{{@tubeRecommendation.areaColor}}"
          ></span>
          <div class="tube-recommendation-tutorial__description">
            {{@tubeRecommendation.tubeDescription}}
          </div>
          <h3 class="tube-recommendation-tutorial__title">
            {{t "pages.campaign-review.sub-table.title" count=@tubeRecommendation.tutorials.length}}
          </h3>
          <table class="tube-recommendation-tutorial-table">
            <tbody>
              {{#each @tubeRecommendation.tutorials as |tutorial|}}
                <tr aria-label={{t "pages.campaign-review.sub-table.row-title"}} class="table__row--small">
                  <td class="tube-recommendation-tutorial-table__row">
                    <a
                      href={{tutorial.link}}
                      class="link"
                      target="_blank"
                      rel="noopener noreferrer"
                      tabindex="{{if this.isOpen '0' '-1'}}"
                    >{{tutorial.title}}</a>
                    <span class="tube-recommendation-tutorial-table__details">
                      <strong>·</strong>
                      {{t "pages.campaign-review.sub-table.column.source.value" source=tutorial.source}}
                      <strong>·</strong>
                      <span class="tube-recommendation-tutorial-table__format">{{tutorial.format}}</span>
                      <strong>·</strong>
                      {{dayjsDurationHumanize tutorial.duration "seconds"}}
                    </span>
                  </td>
                </tr>
              {{/each}}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  </template>
}
