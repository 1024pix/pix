const _ = require('lodash');
const DomainTransaction = require('../../infrastructure/DomainTransaction');

module.exports = async function importHigherSchoolingRegistration({
  organizationId,
  higherSchoolingRegistrationRepository,
  higherSchoolingRegistrationParser,
}) {
  const higherSchoolingRegistrationSet = higherSchoolingRegistrationParser.parse();

  await DomainTransaction.execute(async (domainTransaction) => {
    const studentNumbersInOrga = await higherSchoolingRegistrationRepository.findStudentNumbersByOrganization(organizationId, domainTransaction);

    const [registrationsToUpdate, registrationsToCreate] = _.partition(higherSchoolingRegistrationSet.registrations, (registration) => {
      return studentNumbersInOrga.includes(registration.studentNumber);
    });

    if (!_.isEmpty(registrationsToUpdate)) {
      for (const registration of registrationsToUpdate) {
        await higherSchoolingRegistrationRepository.saveByStudentNumber(registration, domainTransaction);
      }
    }

    if (!_.isEmpty(registrationsToCreate)) {
      await higherSchoolingRegistrationRepository.batchCreate(registrationsToCreate, domainTransaction);
    }
  });
};
