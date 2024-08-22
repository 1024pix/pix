import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { concat } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

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

  get areas() {
    return this.areasList.sortBy('code');
  }

  @action
  checkTube(tube) {
    if (this.selectedTubeIds.includes(tube.id)) {
      return;
    }
    this.selectedTubeIds.pushObject(tube.id);

    this._triggerOnChange();
  }

  @action
  uncheckTube(tube) {
    const index = this.selectedTubeIds.indexOf(tube.id);
    if (index === -1) {
      return;
    }
    this.selectedTubeIds.removeAt(index);

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
          const competences = area.hasMany('competences').value().toArray();
          return competences.flatMap((competence) => {
            const thematics = competence.hasMany('thematics').value().toArray();
            return thematics.flatMap((thematic) => thematic.hasMany('tubes').value().toArray());
          });
        })
        .filter((tube) => this.selectedTubeIds.includes(tube.id)) ?? []
    );
  }

  <template>
    <section class="badge-form-criterion">
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
          <:label>Taux de réussite requis :</:label>
        </PixInput>
        <Areas
          @areas={{this.areas}}
          @selectedTubeIds={{this.selectedTubeIds}}
          @tubeLevels={{this.tubeLevels}}
          @checkTube={{this.checkTube}}
          @uncheckTube={{this.uncheckTube}}
          @setLevelTube={{this.setLevelTube}}
          @displayDeviceCompatibility={{true}}
        />
      </main>
    </section>
  </template>
}
