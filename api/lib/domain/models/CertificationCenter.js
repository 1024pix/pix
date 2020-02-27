class CertificationCenter {

  constructor({
    id,
    // attributes
    name,
    externalId,
    type,
    createdAt,
    // includes
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.name = name;
    this.externalId = externalId;
    this.type = type;
    this.createdAt = createdAt;
    // includes
    // references
  }
}

module.exports = CertificationCenter;
