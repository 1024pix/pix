class ComplementaryCertificationCourseWithResults {
  constructor({ id, hasExternalJury = false, results, complementaryCertificationBadgeId }) {
    this.id = id;
    this.hasExternalJury = hasExternalJury;
    this.results = results;
    this.complementaryCertificationBadgeId = complementaryCertificationBadgeId;
  }

  isAcquired() {
    if (this.#isUncompleted()) {
      return false;
    }
    return this.results.every(({ acquired }) => acquired);
  }

  static from({ id, hasExternalJury, results, complementaryCertificationBadgeId }) {
    return new ComplementaryCertificationCourseWithResults({
      id,
      hasExternalJury,
      results,
      complementaryCertificationBadgeId,
    });
  }

  #isUncompleted() {
    return this.results.length === 0 || (this.hasExternalJury && this.results.length < 2);
  }
}

export { ComplementaryCertificationCourseWithResults };
