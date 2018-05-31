
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
  } = {}) {
    this.competencesWithMark = _addMarksOnCompetences(allCompetences, competencesEvaluated);
  }
}

module.exports = CertifiedProfile;
