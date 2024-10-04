class TargetProfileSummaryForAdmin {
  #sharedOrganizationId;
  #ownerOrganizationId;

  constructor(params = {}) {
    this.id = params.id;
    this.name = params.name;
    this.outdated = params.outdated;
    this.createdAt = params.createdAt;
    this.#sharedOrganizationId = params.sharedOrganizationId;
    this.#ownerOrganizationId = params.ownerOrganizationId;
  }
  get canDetach() {
    return Boolean(this.#sharedOrganizationId) && this.#sharedOrganizationId !== this.#ownerOrganizationId;
  }
}

export { TargetProfileSummaryForAdmin };
