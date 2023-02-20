class TargetProfileForAdminNewFormat {
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
    thematics = [],
    tubes = [],
  } = {}) {
    this.isNewFormat = true;
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
        new TP_Area({
          id: area.id,
          frameworkId: area.frameworkId,
          title: area.title,
          code: area.code,
          color: area.color,
          competences,
          thematics,
          tubes,
        })
    );
  }

  get canAddStageOfTypeLevel() {
    return true;
  }

  get cappedTubes() {
    return this.areas.flatMap((area) => area.getCappedTubes());
  }

  getContentAsJson(skills) {
    return JSON.stringify(this.areas.flatMap((area) => area.getTubesForContentJson(skills)));
  }

  get maxLevel() {
    const levels = this.areas.map((area) => area.maxLevel);
    return Math.max(...levels);
  }
}

class TP_Area {
  constructor({ id, frameworkId, title, code, color, competences, thematics, tubes }) {
    this.id = id;
    this.frameworkId = frameworkId;
    this.title = title;
    this.code = code;
    this.color = color;
    this.competences = competences
      .filter((competence) => competence.areaId === id)
      .map(
        (competence) =>
          new TP_Competence({
            id: competence.id,
            name: competence.name,
            index: competence.index,
            thematics,
            tubes,
          })
      );
  }

  getCappedTubes() {
    return this.competences.flatMap((competence) => competence.getCappedTubes());
  }

  getTubesForContentJson(skills) {
    return this.competences.flatMap((competence) => competence.getTubesForContentJson(skills, this.frameworkId));
  }

  get maxLevel() {
    const levels = this.competences.map((competence) => competence.maxLevel);
    return Math.max(...levels);
  }
}

class TP_Competence {
  constructor({ id, name, index, thematics, tubes }) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.thematics = thematics
      .filter((thematic) => thematic.competenceId === id)
      .map(
        (thematic) =>
          new TP_Thematic({
            id: thematic.id,
            name: thematic.name,
            index: thematic.index,
            tubes,
          })
      );
  }

  getCappedTubes() {
    return this.thematics.flatMap((thematic) => thematic.getCappedTubes());
  }

  getTubesForContentJson(skills, frameworkId) {
    return this.thematics.flatMap((thematic) => thematic.getTubesForContentJson(skills, frameworkId));
  }

  get maxLevel() {
    const levels = this.thematics.map((thematic) => thematic.maxLevel);
    return Math.max(...levels);
  }
}

class TP_Thematic {
  constructor({ id, name, index, tubes }) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.tubes = tubes
      .filter((tube) => tube.thematicId === id)
      .map(
        (tube) =>
          new TP_Tube({
            id: tube.id,
            name: tube.name,
            practicalTitle: tube.practicalTitle,
            level: tube.level,
            mobile: tube.isMobileCompliant,
            tablet: tube.isTabletCompliant,
          })
      );
  }

  getCappedTubes() {
    return this.tubes.map((tube) => tube.asCappedTubeDTO());
  }

  getTubesForContentJson(skills, frameworkId) {
    return this.tubes.flatMap((tube) => tube.asContentJson(skills, frameworkId));
  }

  get maxLevel() {
    const levels = this.tubes.map((tube) => tube.level);
    return Math.max(...levels);
  }
}

class TP_Tube {
  constructor({ id, name, practicalTitle, level, mobile, tablet }) {
    this.id = id;
    this.name = name;
    this.practicalTitle = practicalTitle;
    this.level = level;
    this.mobile = mobile;
    this.tablet = tablet;
  }

  asCappedTubeDTO() {
    return {
      id: this.id,
      level: this.level,
    };
  }

  asContentJson(skills, frameworkId) {
    return {
      id: this.id,
      level: this.level,
      frameworkId,
      skills: skills.filter((skill) => skill.tubeId === this.id).map((skill) => skill.id),
    };
  }
}

export default TargetProfileForAdminNewFormat;
