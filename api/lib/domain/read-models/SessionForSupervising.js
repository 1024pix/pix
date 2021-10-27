class SessionForSupervising {
  constructor({ id, date, time, examiner, certificationCenterName, room, certificationCandidates } = {}) {
    this.id = id;
    this.date = date;
    this.time = time;
    this.examiner = examiner;
    this.certificationCenterName = certificationCenterName;
    this.room = room;
    this.certificationCandidates = certificationCandidates;
  }
}

module.exports = SessionForSupervising;
