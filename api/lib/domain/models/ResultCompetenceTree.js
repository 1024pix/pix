const Area = require('./Area');
const ResultCompetence = require('./ResultCompetence');

const NOT_PASSED_LEVEL = -1;
const NOT_PASSED_SCORE = 0;

class ResultCompetenceTree {

  constructor({
    id = 1,
    // attributes
    // includes
    areas = [],
    // references
  } = {}) {
    this.id = id;
    // attributes
    // includes
    this.areas = areas;
    // references
  }

  static generateTreeFromCompetenceMarks({ competenceTree, competenceMarks }) {

    const areasWithResultCompetences = competenceTree.areas.map((area) => {

      const areaWithResultCompetences = new Area(area);

      areaWithResultCompetences.resultCompetences = area.competences.map((competence) => {
        const noLevelCompetenceMarkData = { level: NOT_PASSED_LEVEL, score: NOT_PASSED_SCORE };

        const associatedCompetenceMark = competenceMarks
          .find((competenceMark) => competenceMark.competence_code === competence.index) || noLevelCompetenceMarkData;

        return new ResultCompetence({
          id: competence.id,
          index: competence.index,
          level: associatedCompetenceMark.level,
          name: competence.name,
          score: associatedCompetenceMark.score,
        });
      });

      delete areaWithResultCompetences.competences; // XXX Competences duplicate info from resultCompetences

      return areaWithResultCompetences;
    });

    return new ResultCompetenceTree({ areas: areasWithResultCompetences });
  }
}

module.exports = ResultCompetenceTree;
