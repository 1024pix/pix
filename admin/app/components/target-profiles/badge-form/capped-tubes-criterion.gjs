import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { concat } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import sortBy from 'lodash/sortBy';

import Areas from '../../common/tubes-selection/areas';

export default class CappedTubesCriterion extends Component {
  @tracked selectedTubeIds = [];
  @tracked tubeLevels = {};
  @tracked areasList = [];

  constructor() {
    super(...arguments);
    Promise.resolve(this.args.areas).then((areas) => {
      this.areasList = areas;
    });
  }

  get displaySkillDifficultySelection() {
    return this.args.displaySkillDifficultySelection ?? true;
  }

  get areas() {
    return sortBy(this.areasList, 'code');
  }

  @action
  checkTube(tube) {
    if (this.selectedTubeIds.includes(tube.id)) {
      return;
    }
    this.selectedTubeIds = [...this.selectedTubeIds, tube.id];

    this._triggerOnChange();
  }

  @action
  uncheckTube(tube) {
    if (!this.selectedTubeIds.includes(tube.id)) {
      return;
    }
    this.selectedTubeIds = this.selectedTubeIds.filter((id) => id !== tube.id);

    this._triggerOnChange();
  }

  @action
  setLevelTube(tubeId, level) {
    this.tubeLevels = {
      ...this.tubeLevels,
      [tubeId]: parseInt(level),
    };

    this._triggerOnChange();
  }

  _triggerOnChange() {
    const selectedTubesWithLevel = this._getSelectedTubesWithLevel();
    this.args.onTubesSelectionChange(selectedTubesWithLevel);
  }

  _getSelectedTubesWithLevel() {
    return this._selectedTubes.map((tube) => {
      const level = this.tubeLevels[tube.id] ?? tube.level;
      return { id: tube.id, level };
    });
  }

  get _selectedTubes() {
    return (
      this.areasList
        .flatMap((area) => {
          const competences = [...area.hasMany('competences').value()];
          return competences.flatMap((competence) => {
            const thematics = [...competence.hasMany('thematics').value()];
            return thematics.flatMap((thematic) => [...thematic.hasMany('tubes').value()]);
          });
        })
        .filter((tube) => this.selectedTubeIds.includes(tube.id)) ?? []
    );
  }

  <template>
    <article class="badge-form-criterion" data-testid={{@id}}>
      <header>
        <h3>Critère d’obtention sur une sélection de sujets du profil cible</h3>
        <PixButton @variant="secondary" @size="small" @triggerAction={{@remove}}>
          Supprimer
        </PixButton>
      </header>
      <main>
        <PixInput @id={{concat @id "criterionName"}} class="badge-form-criterion__name" {{on "change" @onNameChange}}>
          <:label>Nom du critère :</:label>
        </PixInput>
        <PixInput
          @id={{@id}}
          class="badge-form-criterion__threshold"
          type="number"
          min="1"
          max="100"
          @requiredLabel={{t "common.forms.mandatory"}}
          {{on "change" @onThresholdChange}}
        >
          <:label>Taux de réussite requis</:label>
        </PixInput>
        <Areas
          @areas={{this.areas}}
          @selectedTubeIds={{this.selectedTubeIds}}
          @tubeLevels={{this.tubeLevels}}
          @checkTube={{this.checkTube}}
          @uncheckTube={{this.uncheckTube}}
          @setLevelTube={{this.setLevelTube}}
          @displayDeviceCompatibility={{true}}
          @displaySkillDifficultySelection={{this.displaySkillDifficultySelection}}
        />
      </main>
    </article>
  </template>
}
