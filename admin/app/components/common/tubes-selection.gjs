import PixButtonUpload from '@1024pix/pix-ui/components/pix-button-upload';
import PixMultiSelect from '@1024pix/pix-ui/components/pix-multi-select';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import Card from '../card';
import Areas from './tubes-selection/areas';

const MAX_TUBE_LEVEL = 8;

export default class TubesSelection extends Component {
  @service notifications;

  @tracked selectedFrameworkIds = [];

  @tracked selectedTubeIds = [];
  @tracked totalTubesCount = 0;
  @tracked areas;
  @tracked tubeLevels = {};

  constructor(...args) {
    super(...args);

    if (this.args.initialAreas?.length > 0) {
      this.setInitialFrameworks().then(this.refreshAreas);
    } else {
      this.setDefaultFrameworks();
      this.refreshAreas();
    }

    if (this.args.initialCappedTubes?.length > 0) {
      this.setInitialCheckedTubes();
    }
  }

  setInitialFrameworks() {
    return Promise.resolve(this.args.initialAreas).then((initialAreas) => {
      const initialAreasFrameworks = initialAreas.map((area) => area.frameworkId);
      this.selectedFrameworkIds = Array.from(new Set(initialAreasFrameworks));
    });
  }

  setDefaultFrameworks() {
    const pixFramework = this.args.frameworks.find((framework) => framework.name === 'Pix');
    this.selectedFrameworkIds = [pixFramework.id];
  }

  setInitialCheckedTubes() {
    this.selectedTubeIds = this.args.initialCappedTubes.map((tube) => {
      this.tubeLevels[tube.id] = tube.level;
      return tube.id;
    });
  }

  get frameworkOptions() {
    return this.args.frameworks.map((framework) => {
      return { label: framework.name, value: framework.id };
    });
  }

  get selectedFrameworks() {
    return this.args.frameworks.filter((framework) => this.selectedFrameworkIds.includes(framework.id));
  }

  get hasNoFrameworksSelected() {
    return this.selectedFrameworkIds.length === 0;
  }

  @action
  setSelectedFrameworkIds(frameworkIds) {
    this.selectedFrameworkIds = frameworkIds;
    this.refreshAreas();
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

  @action
  async refreshAreas() {
    const selectedFrameworksAreas = (
      await Promise.all(
        this.selectedFrameworks.map(async (framework) => {
          if (framework.areas.isFulfilled) await framework.areas.reload();
          const frameworkAreas = await framework.areas;
          return frameworkAreas.toArray();
        }),
      )
    ).flat();

    this.totalTubesCount = await this._calculateNumberOfTubes(selectedFrameworksAreas);

    this.areas = selectedFrameworksAreas.sort((area1, area2) => {
      return area1.code - area2.code;
    });

    this._triggerOnChange();
  }

  @action
  fillTubesSelectionFromFile([file]) {
    const reader = new FileReader();
    reader.addEventListener('load', (event) => this._onFileLoad(event));
    reader.readAsText(file);
  }

  _triggerOnChange() {
    const selectedTubesWithLevel = this._getSelectedTubesWithLevel();
    this.args.onChange(selectedTubesWithLevel);
  }

  get selectedTubesCount() {
    return this._selectedTubes.length;
  }

  get _selectedTubes() {
    return (
      this.areas
        ?.flatMap((area) => {
          const competences = area.hasMany('competences').value();
          return competences.flatMap((competence) => {
            const thematics = competence.hasMany('thematics').value();
            return thematics.flatMap((thematic) => thematic.hasMany('tubes').value());
          });
        })
        .filter((tube) => this.selectedTubeIds.includes(tube.id)) ?? []
    );
  }

  _onFileLoad(event) {
    try {
      const data = JSON.parse(event.target.result);

      if (!Array.isArray(data)) throw new Error("Le format du fichier n'est pas reconnu.");
      if (data.length === 0) throw new Error('Le fichier ne contient aucun élément.');

      if (typeof data[0] === 'string') {
        this._loadTubesPreselection(data);
      } else if (typeof data[0] === 'object' && typeof data[0].id === 'string') {
        this._loadTargetProfile(data);
      } else {
        throw new Error("Le format du fichier n'est pas reconnu.");
      }

      this._triggerOnChange();
      this.notifications.success('Fichier bien importé.');
    } catch (e) {
      this.notifications.error(e.message);
    }
  }

  _loadTubesPreselection(tubeIds) {
    this.selectedTubeIds = tubeIds;
    this.tubeLevels = {};
    this.setDefaultFrameworks();
  }

  _loadTargetProfile(tubes) {
    this.selectedTubeIds = tubes.map(({ id }) => id);
    this.tubeLevels = Object.fromEntries(tubes.map(({ id, level }) => [id, level]));
    if (tubes[0].frameworkId) {
      this.selectedFrameworkIds = [...new Set(tubes.map(({ frameworkId }) => frameworkId))];
    } else {
      this.setDefaultFrameworks();
    }
  }

  async _calculateNumberOfTubes(areas) {
    const competences = (
      await Promise.all(areas.map(async (area) => await area.hasMany('competences').value()))
    ).flat();
    const thematics = (
      await Promise.all(competences.map(async (competence) => await competence.hasMany('thematics').value()))
    ).flat();
    const tubes = (
      await Promise.all(thematics.map(async (thematic) => await thematic.hasMany('tubes').value()))
    ).flat();
    return tubes.length;
  }

  _getSelectedTubesWithLevel() {
    return this._selectedTubes.map((tube) => {
      const level = this.tubeLevels[tube.id] ?? MAX_TUBE_LEVEL;
      return { id: tube.id, level };
    });
  }

  <template>
    <div class="tubes-selection">
      <Card class="tubes-selection__card" @title="Sélection des sujets">
        <div class="tubes-selection__inline-layout">
          <PixMultiSelect
            class="tubes-selection__multi-select"
            @placeholder="Sélectionner les référentiels souhaités"
            @id="framework-list"
            @isSearchable={{true}}
            @inlineLabel={{true}}
            @showOptionsOnInput={{true}}
            @onChange={{this.setSelectedFrameworkIds}}
            @emptyMessage="Pas de résultat"
            @values={{this.selectedFrameworkIds}}
            @options={{this.frameworkOptions}}
          >
            <:label>Référentiels :</:label>
            <:default as |option|>{{option.label}}</:default>
          </PixMultiSelect>
          {{#if @displayJsonImportButton}}
            <div class="tubes-selection__vertical-delimiter"></div>
            <PixButtonUpload
              @onChange={{this.fillTubesSelectionFromFile}}
              @variant="secondary"
              @size="small"
              @id="file-upload"
              accept=".json"
            >
              Importer un fichier JSON
            </PixButtonUpload>
          {{/if}}
          <PixTag class="tubes-selection__count" @color="neutral">
            {{this.selectedTubesCount}}/{{this.totalTubesCount}}
            sujet(s) sélectionné(s)
          </PixTag>
        </div>
      </Card>

      {{#if this.hasNoFrameworksSelected}}
        Aucun référentiel de sélectionné
      {{else}}
        <Areas
          @areas={{this.areas}}
          @setLevelTube={{this.setLevelTube}}
          @selectedTubeIds={{this.selectedTubeIds}}
          @checkTube={{this.checkTube}}
          @uncheckTube={{this.uncheckTube}}
          @tubeLevels={{this.tubeLevels}}
          @displayDeviceCompatibility={{@displayDeviceCompatibility}}
          @displaySkillDifficultyAvailability={{@displaySkillDifficultyAvailability}}
        />
      {{/if}}
    </div>
  </template>
}
