class AreaForAdmin {
  constructor({ id, frameworkId, title, code, color, allCompetences, allThematics, allTubes, allSkills }) {
    this.id = id;
    this.frameworkId = frameworkId;
    this.title = title;
    this.code = code;
    this.color = color;
    this.competences = allCompetences
      .filter((competence) => competence.areaId === id)
      .map(
        (competence) =>
          new CompetenceForAdmin({
            id: competence.id,
            name: competence.name,
            index: competence.index,
            allThematics,
            allTubes,
            allSkills,
          }),
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

  toDTOWithoutThematics() {
    return {
      id: this.id,
      frameworkId: this.frameworkId,
      title: this.title,
      code: this.code,
      color: this.color,
      competences: this.competences.map((competence) => competence.toDTOWithoutThematics()),
    };
  }
}

class CompetenceForAdmin {
  constructor({ id, name, index, allThematics, allTubes, allSkills }) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.thematics = allThematics
      .filter((thematic) => thematic.competenceId === id)
      .map(
        (thematic) =>
          new ThematicForAdmin({
            id: thematic.id,
            name: thematic.name,
            index: thematic.index,
            allTubes,
            allSkills,
          }),
      )
      .filter((thematic) => {
        return thematic.tubes.length > 0;
      });
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

  toDTOWithoutThematics() {
    return {
      id: this.id,
      name: this.name,
      index: this.index,
    };
  }
}

class ThematicForAdmin {
  constructor({ id, name, index, allTubes, allSkills }) {
    this.id = id;
    this.name = name;
    this.index = index;
    this.tubes = allTubes
      .filter((tube) => tube.thematicId === id)
      .map(
        (tube) =>
          new TubeForAdmin({
            id: tube.id,
            name: tube.name,
            practicalTitle: tube.practicalTitle,
            level: tube.level,
            mobile: tube.isMobileCompliant,
            tablet: tube.isTabletCompliant,
            allSkills,
          }),
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

class TubeForAdmin {
  constructor({ id, name, practicalTitle, level, mobile, tablet, allSkills }) {
    this.id = id;
    this.name = name;
    this.practicalTitle = practicalTitle;
    this.level = level || 8;
    this.mobile = mobile;
    this.tablet = tablet;
    this.skills = allSkills
      .filter((skill) => skill.tubeId === id)
      .map(
        (skill) =>
          new SkillForAdmin({
            id: skill.id,
            difficulty: skill.difficulty,
          }),
      );
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

class SkillForAdmin {
  constructor({ id, difficulty }) {
    this.id = id;
    this.difficulty = difficulty;
  }
}

export { AreaForAdmin, CompetenceForAdmin, SkillForAdmin, ThematicForAdmin, TubeForAdmin };
