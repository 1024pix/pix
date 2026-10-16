import { PixIcon, PixStars } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ShowMoreText from 'mon-pix/components/show-more-text';

import { competencesIcons } from '../../results/evaluation-results-tabs/results-details/competence-row';

export default class MobileResultsDetails extends Component {
  baseId = guidFor(this);

  // Un seul domaine ouvert à la fois, le premier par défaut
  @tracked openAreaId = `${this.baseId}-0`;

  get areas() {
    return this.args.competenceResults.reduce((areas, competenceResult) => {
      const existingArea = areas.find((area) => area.areaTitle === competenceResult.areaTitle);
      if (existingArea) {
        existingArea.competences.push(competenceResult);
      } else {
        areas.push({
          id: `${this.baseId}-${areas.length}`,
          areaTitle: competenceResult.areaTitle,
          areaColor: competenceResult.areaColor,
          competences: [competenceResult],
        });
      }
      return areas;
    }, []);
  }

  get total() {
    return this.args.totalStage - 1;
  }

  getIcon = (competenceId) => competencesIcons[competenceId] || competencesIcons.pixplus;

  isExpanded = (areaId) => this.openAreaId === areaId;

  @action toggleArea(areaId) {
    this.openAreaId = this.openAreaId === areaId ? null : areaId;
  }

  <template>
    <section class="reco-mobile-results-details">
      <h2 class="reco-mobile-section__title">{{t "pages.skill-review.tabs.results-details.title"}}</h2>
      <p class="reco-mobile-section__description">{{t "pages.skill-review.tabs.results-details.description"}}</p>

      <ol class="reco-mobile-results-details__areas">
        {{#each this.areas as |area|}}
          <li class="reco-mobile-area reco-mobile-area--{{area.areaColor}}">
            <h3>
              <button
                type="button"
                class="reco-mobile-area__header"
                aria-expanded={{if (this.isExpanded area.id) "true" "false"}}
                aria-controls={{area.id}}
                {{on "click" (fn this.toggleArea area.id)}}
              >
                <span>{{area.areaTitle}}</span>
                <PixIcon @name={{if (this.isExpanded area.id) "chevronTop" "chevronBottom"}} @ariaHidden={{true}} />
              </button>
            </h3>
            <ul id={{area.id}} class="reco-mobile-area__competences" hidden={{if (this.isExpanded area.id) false true}}>
              {{#each area.competences as |competence|}}
                <li class="reco-mobile-competence">
                  <img class="reco-mobile-competence__icon" src={{this.getIcon competence.id}} alt="" />
                  <div class="reco-mobile-competence__content">
                    <h4 class="reco-mobile-competence__name">{{competence.name}}</h4>
                    <ShowMoreText class="reco-mobile-competence__description">
                      {{competence.description}}
                    </ShowMoreText>
                    {{#if this.total}}
                      <PixStars
                        class="reco-mobile-competence__stars"
                        @count={{competence.acquiredStagesCount}}
                        @total={{this.total}}
                        @alt={{t
                          "pages.skill-review.stage.starsAcquired"
                          acquired=competence.acquiredStagesCount
                          total=this.total
                        }}
                        @color="yellow"
                      />
                    {{/if}}
                    <p class="reco-mobile-competence__rate">
                      {{t "pages.skill-review.stage.masteryPercentage" rate=competence.masteryRate}}
                    </p>
                  </div>
                </li>
              {{/each}}
            </ul>
          </li>
        {{/each}}
      </ol>
    </section>
  </template>
}
