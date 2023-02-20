import Area from './Area';
import ResultCompetence from './ResultCompetence';

const NOT_PASSED_LEVEL = -1;
const NOT_PASSED_SCORE = 0;

class ResultCompetenceTree {
  constructor({ id, areas = [] } = {}) {
    this.id = id;
    this.areas = areas;
  }

  static generateTreeFromCompetenceMarks({ competenceTree, competenceMarks, certificationId, assessmentResultId }) {
    const areasWithResultCompetences = competenceTree.areas.map((area) => {
      const areaWithResultCompetences = new Area(area);

      areaWithResultCompetences.resultCompetences = area.competences.map((competence) => {
        const noLevelCompetenceMarkData = { level: NOT_PASSED_LEVEL, score: NOT_PASSED_SCORE };

        const associatedCompetenceMark =
          competenceMarks.find((competenceMark) => competenceMark.competence_code === competence.index) ||
          noLevelCompetenceMarkData;

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

    return new ResultCompetenceTree({
      id: `${certificationId}-${assessmentResultId}`,
      areas: areasWithResultCompetences,
    });
  }
}

export default ResultCompetenceTree;
