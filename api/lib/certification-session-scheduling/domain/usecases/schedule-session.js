const SessionScheduled = require('../events/SessionScheduled');
const { Session } = require('../models/Session');
const { DomainError } = require('../errors/DomainError');

async function scheduleSession({
  command: {
    certificationCenterId,
    address,
    examiner,
    room,
    date,
    time,
    description,
    referentId,
  },
  dependencies: {
    sessionRepository,
    certificationCenterMembershipRepository,
    certificationCenterRepository,
    random,
  },
}) {
  const hasMembership = await certificationCenterMembershipRepository.exists({ referentId, certificationCenterId });

  if (!hasMembership) {
    throw new ReferentIsNotAMemberOfCertificationCenterError();
  }

  const certificationCenter = await certificationCenterRepository.get(certificationCenterId);
  const scheduledSession = Session.schedule({
    certificationCenterId,
    certificationCenterName: certificationCenter.name,
    address,
    examiner,
    room,
    date,
    time,
    description,
  }, random.pickOneFrom);

  const sessionId = await sessionRepository.save(scheduledSession);

  return new SessionScheduled({ sessionId });
}

class ReferentIsNotAMemberOfCertificationCenterError extends DomainError {
  constructor() {
    super('Referent is not a member of the certification center');
  }
}

module.exports = {
  scheduleSession,
  ReferentIsNotAMemberOfCertificationCenterError,
};
