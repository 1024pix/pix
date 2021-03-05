class CertifiedSkill {
  constructor({
    id,
    name,
    hasBeenAskedInCertif,
    tubeId,
  }) {
    this.id = id;
    this.name = name;
    this.hasBeenAskedInCertif = hasBeenAskedInCertif;
    this.tubeId = tubeId;
    this.difficulty = parseInt(name.slice(-1));
  }
}

class CertifiedTube {
  constructor({
    id,
    name,
    competenceId,
  }) {
    this.id = id;
    this.name = name;
    this.competenceId = competenceId;
  }
}

class CertifiedCompetence {
  constructor({
    id,
    name,
    areaId,
  }) {
    this.id = id;
    this.name = name;
    this.areaId = areaId;
  }
}

class CertifiedArea {
  constructor({
    id,
    name,
    color,
  }) {
    this.id = id;
    this.name = name;
    this.color = color;
  }
}

class CertifiedProfile {
  constructor({
    id,
    userId,
    certifiedSkills,
    certifiedTubes,
    certifiedCompetences,
    certifiedAreas,
  }) {
    this.id = id;
    this.userId = userId;
    this.certifiedSkills = certifiedSkills;
    this.certifiedTubes = certifiedTubes;
    this.certifiedCompetences = certifiedCompetences;
    this.certifiedAreas = certifiedAreas;
  }
}

module.exports = {
  CertifiedProfile,
  CertifiedArea,
  CertifiedCompetence,
  CertifiedTube,
  CertifiedSkill,
};
