class CpfExport {
  filename;
  lastModifiedDate;

  constructor({ filename, lastModifiedDate }) {
    this.filename = filename;
    this.lastModifiedDate = lastModifiedDate;
  }
}

export { CpfExport };
