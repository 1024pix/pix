import PixBlock from '@1024pix/pix-ui/components/pix-block';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import sortBy from 'lodash/sortBy';

import Area from '../../../common/tubes-details/area';

export default class FrameworkContentDetails extends Component {
  get areas() {
    return sortBy(Array.from(this.args.areas), ['frameworkId', 'code']).map((area) => this.buildAreaViewModel(area));
  }

  buildAreaViewModel(area) {
    return {
      title: `${area.code} · ${area.title}`,
      color: area.color,
      competences: sortBy(area.hasMany('competences').value(), 'index').map((competence) =>
        this.buildCompetenceViewModel(competence),
      ),
    };
  }

  buildCompetenceViewModel(competence) {
    return {
      id: competence.id,
      title: `${competence.index} ${competence.name}`,
      thematics: sortBy(competence.hasMany('thematics').value(), 'index').map((thematic) =>
        this.buildThematicViewModel(thematic),
      ),
    };
  }

  buildThematicViewModel(thematic) {
    return {
      name: thematic.name,
      nbTubes: thematic.hasMany('tubes').value().length,
      tubes: sortBy(thematic.hasMany('tubes').value(), 'practicalTitle').map((tube) => this.buildTubeViewModel(tube)),
    };
  }

  buildTubeViewModel(tube) {
    return {
      id: tube.id,
      title: `${tube.name} : ${tube.practicalTitle}`,
      level: undefined,
      mobile: tube.mobile,
      tablet: tube.tablet,
      skills: sortBy(tube.hasMany('skills').value(), 'difficulty').map((skill) => this.buildSkillViewModel(skill)),
    };
  }

  buildSkillViewModel(skill) {
    return {
      id: skill.id,
      difficulty: skill.difficulty,
    };
  }

  <template>
    <h2 class="certification-version-detail-modal__subtitle">{{t
        "components.certification-frameworks.item.frameworks.version-detail-modal.content"
      }}</h2>
    <PixBlock class="certification-version-detail-modal__content">
      {{#each this.areas as |area|}}
        <Area
          @title={{area.title}}
          @color={{area.color}}
          @competences={{area.competences}}
          @displayDeviceCompatibility={{true}}
          @displaySkillDifficultyAvailability={{true}}
        />
      {{/each}}
    </PixBlock>
  </template>
}
