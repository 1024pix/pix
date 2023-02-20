class TargetProfileForAdminOldFormat {
  constructor({
    id,
    name,
    outdated,
    isPublic,
    createdAt,
    ownerOrganizationId,
    description,
    comment,
    imageUrl,
    category,
    isSimplifiedAccess,
    badges,
    areas = [],
    competences = [],
    tubes = [],
    skills = [],
  } = {}) {
    this.isNewFormat = false;
    this.id = id;
    this.name = name;
    this.outdated = outdated;
    this.isPublic = isPublic;
    this.createdAt = createdAt;
    this.ownerOrganizationId = ownerOrganizationId;
    this.description = description;
    this.comment = comment;
    this.imageUrl = imageUrl;
    this.category = category;
    this.isSimplifiedAccess = isSimplifiedAccess;
    this.badges = badges;
    this.areas = areas.map(
      (area) =>
        new TP_Area({ id: area.id, title: area.title, code: area.code, color: area.color, competences, tubes, skills })
    );
  }

  get canAddStageOfTypeLevel() {
    return false;
  }
}

class TP_Area {
  constructor({ id, title, code, color, competences, tubes, skills }) {
    this.id = id;
    this.title = title;
    this.code = code;
    this.color = color;
    this.competences = competences
      .filter((competence) => competence.areaId === id)
      .map(
        (competence) =>
          new TP_Competence({ id: competence.id, name: competence.name, index: competence.index, tubes, skills })
      );
  }
}

class TP_Competence {
  constructor({ id, name, index, tubes, skills }) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.tubes = tubes
      .filter((tube) => tube.competenceId === id)
      .map((tube) => new TP_Tube({ id: tube.id, practicalTitle: tube.practicalTitle, skills }));
  }
}

class TP_Tube {
  constructor({ id, practicalTitle, skills }) {
    this.id = id;
    this.practicalTitle = practicalTitle;
    this.skills = skills
      .filter((skill) => skill.tubeId === id)
      .map((skill) => new TP_Skill({ id: skill.id, name: skill.name, difficulty: skill.difficulty }));
  }
}

class TP_Skill {
  constructor({ id, name, difficulty }) {
    this.id = id;
    this.name = name;
    this.difficulty = difficulty;
  }
}

export default TargetProfileForAdminOldFormat;
