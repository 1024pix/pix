class GrantedAccreditation {
  constructor({ id, accreditationId, certificationCenterId }) {
    this.id = id;
    this.accreditationId = accreditationId;
    this.certificationCenterId = certificationCenterId;
  }
}

module.exports = GrantedAccreditation;
