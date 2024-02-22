class SessionForSupervising {
  constructor({
    id,
    date,
    time,
    examiner,
    certificationCenterName,
    room,
    certificationCandidates,
    accessCode,
    address,
  } = {}) {
    this.id = id;
    this.date = date;
    this.time = time;
    this.examiner = examiner;
    this.certificationCenterName = certificationCenterName;
    this.room = room;
    this.certificationCandidates = certificationCandidates;
    this.accessCode = accessCode;
    this.address = address;
  }
}

export { SessionForSupervising };
