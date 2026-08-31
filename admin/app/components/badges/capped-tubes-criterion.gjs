import Component from '@glimmer/component';
import sortBy from 'lodash/sortBy';

import Area from '../common/tubes-details/area';

// TODO check
export default class CappedTubesCriterion extends Component {
  get areasForView() {
    return sortBy(this.args.targetProfile.hasMany('areas').value(), 'code')
      .map((area) => ({
        area,
        competences: this._buildCompetencesViewModel(area.hasMany('competences').value()),
      }))
      .filter(({ competences }) => competences.length !== 0)
      .map(({ area, competences }) => ({
        title: `${area.code} · ${area.title}`,
        color: area.color,
        competences,
      }));
  }

  _buildCompetencesViewModel(competences) {
    return sortBy(competences, 'index')
      .map((competence) => ({
        competence,
        thematics: this._buildThematicsViewModel(competence.hasMany('thematics').value()),
      }))
      .filter(({ thematics }) => thematics.length !== 0)
      .map(({ competence, thematics }) => ({
        title: `${competence.index} ${competence.name}`,
        thematics,
      }));
  }

  _buildThematicsViewModel(thematics) {
    return sortBy(thematics, 'index')
      .map((thematic) => ({
        thematic,
        tubes: this._buildTubesViewModel(thematic.hasMany('tubes').value()),
      }))
      .filter(({ tubes }) => tubes.length !== 0)
      .map(({ thematic, tubes }) => ({
        name: thematic.name,
        nbTubes: tubes.length,
        tubes,
      }));
  }

  _buildTubesViewModel(tubes) {
    return sortBy(tubes, 'practicalName')
      .map((tube) => ({
        tube,
        cappedTube: this.args.criterion.cappedTubes.find(({ tubeId }) => tubeId === tube.id),
      }))
      .filter(({ cappedTube }) => cappedTube)
      .map(({ tube, cappedTube }) => ({
        id: tube.id,
        title: `${tube.name} : ${tube.practicalTitle}`,
        level: cappedTube.level,
        tablet: tube.tablet,
        mobile: tube.mobile,
      }));
  }

  <template>
    <div class="card__title">
      {{#if @criterion.name}}
        <strong>{{@criterion.name}}</strong>
      {{else}}
        Critère
      {{/if}}
    </div>

    <div class="card__content">
      <p class="capped-tubes-criterion__text" data-testid="toujourstriste">
        L'évalué doit obtenir
        <strong>{{@criterion.threshold}}%</strong>
        {{#if @criterion.name}}
          sur le groupe
          <strong>{{@criterion.name}}</strong>
          possédant
        {{else}}
          sur tous
        {{/if}}
        les sujets plafonnés par niveau suivants :
      </p>

      <div class="badge-form-criterion">
        {{#each this.areasForView as |area|}}
          <Area
            @title={{area.title}}
            @color={{area.color}}
            @competences={{area.competences}}
            @displayDeviceCompatibility={{true}}
          />
        {{/each}}
      </div>
    </div>
  </template>
}
