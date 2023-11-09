class CpfInfos {
  certificationCourseId;
  filename;
  importStatus;

  constructor({ certificationCourseId, filename, importStatus }) {
    this.certificationCourseId = certificationCourseId;
    this.filename = filename;
    this.importStatus = importStatus;
  }
}

export { CpfInfos };
