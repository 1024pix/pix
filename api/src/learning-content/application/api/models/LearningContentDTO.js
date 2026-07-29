import { FRENCH_SPOKEN } from '../../../../shared/domain/services/locale-service.js';

export class LearningContentDTO {
  /**
   * @param {object} params
   * @param {FrameworkDTO[]} params.frameworkDTOs
   */
  constructor({ frameworkDTOs }) {
    this.frameworkDTOs = frameworkDTOs;
  }

  static buildFromView(learningContentView, locale) {
    return new LearningContentDTO({
      frameworkDTOs: learningContentView.frameworkViews.map((frameworkView) =>
        FrameworkDTO.buildFromView(frameworkView, locale),
      ),
    });
  }
}

class FrameworkDTO {
  /**
   * @param {object} params
   * @param {string} params.id
   * @param {string} params.name
   * @param {AreaDTO[]} params.areaDTOs
   */
  constructor({ id, name, areaDTOs }) {
    this.id = id;
    this.name = name;
    this.areaDTOs = areaDTOs;
  }

  static buildFromView(frameworkView, locale) {
    return new FrameworkDTO({
      id: frameworkView.id,
      name: frameworkView.name,
      areaDTOs: frameworkView.areaViews.map((areaView) => AreaDTO.buildFromView(areaView, locale)),
    });
  }
}

class AreaDTO {
  /**
   * @param {object} params
   * @param {string} params.id
   * @param {object} params.title
   * @param {string} params.code
   * @param {string} params.color
   * @param {CompetenceDTO[]} params.competenceDTOs
   */
  constructor({ id, title, code, color, competenceDTOs }) {
    this.id = id;
    this.title = title;
    this.code = code;
    this.color = color;
    this.competenceDTOs = competenceDTOs;
  }

  static buildFromView(areaView, locale) {
    return new AreaDTO({
      id: areaView.id,
      title: areaView.title_i18n?.[locale] ?? areaView.title_i18n[FRENCH_SPOKEN] ?? null,
      code: areaView.code,
      color: areaView.color,
      competenceDTOs: areaView.competenceViews.map((competenceView) =>
        CompetenceDTO.buildFromView(competenceView, locale),
      ),
    });
  }
}

class CompetenceDTO {
  /**
   * @param {object} params
   * @param {string} params.id
   * @param {object} params.name
   * @param {string} params.index
   * @param {ThematicDTO[]} params.thematicDTOs
   */
  constructor({ id, name, index, thematicDTOs }) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.thematicDTOs = thematicDTOs;
  }

  static buildFromView(competenceView, locale) {
    return new CompetenceDTO({
      id: competenceView.id,
      name: competenceView.name_i18n?.[locale] ?? competenceView.name_i18n[FRENCH_SPOKEN] ?? null,
      index: competenceView.index,
      thematicDTOs: competenceView.thematicViews.map((thematicView) => ThematicDTO.buildFromView(thematicView, locale)),
    });
  }
}

class ThematicDTO {
  /**
   * @param {object} params
   * @param {string} params.id
   * @param {object} params.name
   * @param {string} params.index
   * @param {TubeDTO[]} params.tubeDTOs
   */
  constructor({ id, name, index, tubeDTOs }) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.tubeDTOs = tubeDTOs;
  }

  static buildFromView(thematicView, locale) {
    return new ThematicDTO({
      id: thematicView.id,
      name: thematicView.name_i18n?.[locale] ?? thematicView.name_i18n[FRENCH_SPOKEN] ?? null,
      index: thematicView.index,
      tubeDTOs: thematicView.tubeViews.map((tubeView) => TubeDTO.buildFromView(tubeView, locale)),
    });
  }
}

class TubeDTO {
  /**
   * @param {object} params
   * @param {string} params.id
   * @param {string} params.name
   * @param {object} params.practicalTitle
   */
  constructor({ id, name, practicalTitle }) {
    this.id = id;
    this.name = name;
    this.practicalTitle = practicalTitle;
  }

  static buildFromView(tubeView, locale) {
    return new TubeDTO({
      id: tubeView.id,
      name: tubeView.name,
      practicalTitle: tubeView.practicalTitle_i18n?.[locale] ?? tubeView.practicalTitle_i18n[FRENCH_SPOKEN] ?? null,
    });
  }
}
