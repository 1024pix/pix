class TargetProfileOverview {
  constructor({
    id,
    name,
    internalName,
    imageUrl,
    category,
    isSimplifiedAccess,
    outdated,
    badges,
    frameworks,
    description,
  } = {}) {
    this.id = id;
    this.name = name;
    this.internalName = internalName;
    this.imageUrl = imageUrl;
    this.category = category;
    this.isSimplifiedAccess = isSimplifiedAccess;
    this.outdated = outdated;
    this.badges = badges;
    this.frameworks = frameworks;
    this.description = description;
  }

  get level() {
    if (this.frameworks?.length > 0) {
      const areas = this.frameworks.flatMap((framework) => framework.areas ?? []);
      const competences = areas.flatMap((area) => area.competences ?? []);
      const tubes = competences.flatMap((competence) => competence.tubes ?? []);

      const maxTubes = tubes.map((tube) => tube.maxLevel ?? 0);
      if (maxTubes.length === 0) {
        return 0;
      }
      return maxTubes.reduce((total, value) => total + value, 0) / maxTubes.length;
    }
    return 0;
  }
}

export { TargetProfileOverview };
