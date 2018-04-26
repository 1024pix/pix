class Certification {

  constructor({ id, date, certificationCenter } = {}) {
    this.id = id;
    this.date = date;
    this.certificationCenter = certificationCenter;
  }
}

module.exports = Certification;
