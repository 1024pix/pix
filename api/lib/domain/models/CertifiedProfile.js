const _ = require('lodash');

function _insertAreaAndCompetence(table, area, competence) {
  const areaFind = _.find(table, area);
  if(areaFind) {
    areaFind.competences.push(competence);
  } else {
    area.competences.push(competence);
    table.push(area);
  }
  return table;
}

function _addMarksOnCompetences(allCompetences, competencesEvaluated) {
  return allCompetences.map(competence => {
    const competenceWithMark = {
      competenceName: competence.name,
      competenceIndex: competence.index,
      areaName: competence.area.title,
      areaIndex: competence.area.code,
    };
    const competenceMark = competencesEvaluated.find((competenceMark) => competenceMark.competence_code === competence.index);
    competenceWithMark.level = (competenceMark) ? competenceMark.level : -1;
    return competenceWithMark;
  });
}

class CertifiedProfile {

  constructor({
    allCompetences = [],
    competencesEvaluated = [],
    id = 0,
  } = {}) {
    this.id = id;
    this.competencesWithMark = _addMarksOnCompetences(allCompetences, competencesEvaluated);
  }

  organizeCompetences() {
    let organizedCompetences = [];
    _(this.competencesWithMark).sortBy((competence) => competence.competenceIndex)
      .forEach((competence) => {
        const area = {
          areaName: competence.areaName,
          areaIndex: competence.areaIndex,
          competences: [],
        };
        const competenceInArea = {
          competenceName: competence.competenceName,
          competenceIndex: competence.competenceIndex,
          level: competence.level,
        };
        organizedCompetences = _insertAreaAndCompetence(organizedCompetences, area, competenceInArea);
      });

    return organizedCompetences;
  }
}

module.exports = CertifiedProfile;
