class CertifiedSkill {
  constructor({ id, name, hasBeenAskedInCertif, tubeId, difficulty }) {
    this.id = id;
    this.name = name;
    this.hasBeenAskedInCertif = hasBeenAskedInCertif;
    this.tubeId = tubeId;
    this.difficulty = difficulty;
  }
}

class CertifiedTube {
  constructor({ id, name, competenceId }) {
    this.id = id;
    this.name = name;
    this.competenceId = competenceId;
  }
}

class CertifiedCompetence {
  constructor({ id, name, areaId, origin }) {
    this.id = id;
    this.name = name;
    this.areaId = areaId;
    this.origin = origin;
  }
}

class CertifiedArea {
  constructor({ id, name, color }) {
    this.id = id;
    this.name = name;
    this.color = color;
  }
}

class CertifiedProfile {
  constructor({ id, userId, certifiedSkills, certifiedTubes, certifiedCompetences, certifiedAreas }) {
    this.id = id;
    this.userId = userId;
    this.certifiedSkills = certifiedSkills;
    this.certifiedTubes = certifiedTubes;
    this.certifiedCompetences = certifiedCompetences;
    this.certifiedAreas = certifiedAreas;
  }
}

export default {
  CertifiedProfile,
  CertifiedArea,
  CertifiedCompetence,
  CertifiedTube,
  CertifiedSkill,
};
