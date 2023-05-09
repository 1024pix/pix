const getCertificationPointOfContact = async function ({ userId, certificationPointOfContactRepository }) {
  return certificationPointOfContactRepository.get(userId);
};

export { getCertificationPointOfContact };
