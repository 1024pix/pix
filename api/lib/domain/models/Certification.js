class Certification {

  constructor({ id, date, certificationCenter, isPublished, pixScore, status } = {}) {
    this.id = id;
    this.date = date;
    this.certificationCenter = certificationCenter;
    this.isPublished = isPublished;
    this.pixScore = pixScore;
    this.status = status;
  }
}

module.exports = Certification;
