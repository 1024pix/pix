export class FrameworkInfo {
  constructor({ id, scope, versionSummaries, targetProfileSummaries }) {
    this.id = id;
    this.scope = scope;
    this.versionSummaries = versionSummaries;
    this.targetProfileSummaries = targetProfileSummaries;
  }
}
