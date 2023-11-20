import { TrainingTrigger } from '../../../../lib/domain/models/TrainingTrigger.js';

const { types } = TrainingTrigger;

class TrainingTriggerForAdmin {
  constructor({ id, trainingId, triggerTubes, type, threshold, areas = [], competences = [], thematics = [] } = {}) {
    this.id = id;
    this.trainingId = trainingId;
    if (!Object.values(types).includes(type)) {
      throw new Error('Invalid trigger type');
    }
    this.type = type;
    this.threshold = threshold;
    this.tubesCount = triggerTubes.length;
    this.areas = areas.map(
      (area) => new _Area({ ...area, competences, thematics, triggerTubes, trainingTriggerId: id }),
    );
  }
}

TrainingTriggerForAdmin.types = TrainingTrigger.types;

class _Area {
  constructor({ id, title, code, color, competences = [], thematics = [], triggerTubes = [], trainingTriggerId } = {}) {
    this.id = `${id}_${trainingTriggerId}`;
    this.title = title;
    this.code = code;
    this.color = color;

    this.competences = competences
      .filter((competence) => competence.areaId === id)
      .map((competence) => new _Competence({ ...competence, thematics, triggerTubes, trainingTriggerId }));
  }
}

class _Competence {
  constructor({ id, name, index, thematics = [], triggerTubes = [], trainingTriggerId } = {}) {
    this.id = `${id}_${trainingTriggerId}`;
    this.name = name;
    this.index = index;

    this.thematics = thematics
      .filter((thematic) => thematic.competenceId === id)
      .map((thematic) => new _Thematic({ ...thematic, triggerTubes, trainingTriggerId }));
  }
}

class _Thematic {
  constructor({ id, name, index, triggerTubes = [], trainingTriggerId } = {}) {
    this.id = `${id}_${trainingTriggerId}`;
    this.name = name;
    this.index = index;

    this.triggerTubes = triggerTubes.filter((trainingTriggerTube) => trainingTriggerTube.tube.thematicId === id);
  }
}

export { TrainingTriggerForAdmin };
