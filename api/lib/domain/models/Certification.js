class Certification {

  constructor({ id, date, certificationCenter, isPublished } = {}) {
    this.id = id;
    this.date = date;
    this.certificationCenter = certificationCenter;
    this.isPublished = isPublished;
  }
}

module.exports = Certification;
