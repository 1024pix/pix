const _ = require('lodash');
const { findMatchingCandidateIdForGivenUser } = require('../../domain/services/user-reconciliation-service');
const DomainTransaction = require('../../infrastructure/DomainTransaction');

function getMatchingSchoolingRegistration(registration, existingRegistrations) {
  const matchingCandidateId = findMatchingCandidateIdForGivenUser(existingRegistrations, registration);
  const matchingCandidate = existingRegistrations.find((existing) => existing.id === matchingCandidateId);
  if (!matchingCandidate || matchingCandidate.birthdate !== registration.birthdate) {
    return null;
  }
  return matchingCandidate;
}

module.exports = async function importHigherSchoolingRegistration({
  organizationId,
  higherSchoolingRegistrationRepository,
  higherSchoolingRegistrationParser,
}) {
  const higherSchoolingRegistrationSet = higherSchoolingRegistrationParser.parse();

  await DomainTransaction.execute(async (domainTransaction) => {
    const studentNumbersInOrga = await higherSchoolingRegistrationRepository.findStudentNumbersNonSupernumerary(organizationId, domainTransaction);
    const [registrationsToUpdate, registrationsToCheck] = _.partition(higherSchoolingRegistrationSet.registrations, (registration) => {
      return studentNumbersInOrga.includes(registration.studentNumber);
    });
  
    for (const registration of registrationsToUpdate) {
      await higherSchoolingRegistrationRepository.saveNonSupernumerary(registration, domainTransaction);
    }
    
    const supernumeraryRegistrations = await higherSchoolingRegistrationRepository.findSupernumerary(organizationId, domainTransaction);

    const registrationsToCreate = [];
    for (const registration of registrationsToCheck) {
      const existingRegistrations = _.filter(supernumeraryRegistrations, ({ studentNumber }) => registration.studentNumber === studentNumber);
      const matchingRegistration = getMatchingSchoolingRegistration(registration, existingRegistrations);
      if (matchingRegistration) {
        await higherSchoolingRegistrationRepository.save({ id: matchingRegistration.id, ...registration } , domainTransaction);
      } else {
        registrationsToCreate.push(registration);
      }
    }

    if (!_.isEmpty(registrationsToCreate)) {
      await higherSchoolingRegistrationRepository.batchCreate(registrationsToCreate, domainTransaction);
    }
  });
};
