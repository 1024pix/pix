class ScoOrganizationLearnerSet {
  #learners;

  constructor(learners) {
    this.#learners = learners;
  }

  reconcile(reconciledStudents, allOrganizationLearnersInSameOrganization) {
    const userIdsWithMultipleNationalStudentIds = new Set(
      reconciledStudents
        .filter((learner) =>
          reconciledStudents.some(
            (other) =>
              other.account.userId === learner.account.userId && other.nationalStudentId !== learner.nationalStudentId,
          ),
        )
        .map((learner) => learner.account.userId),
    );

    reconciledStudents.forEach((reconciledStudent) => {
      const alreadyReconciledStudentToImport = this.#learners.find(
        (studentToImport) => studentToImport.userId === reconciledStudent.account.userId,
      );

      if (alreadyReconciledStudentToImport) {
        alreadyReconciledStudentToImport.userId = null;
        return;
      }

      if (userIdsWithMultipleNationalStudentIds.has(reconciledStudent.account.userId)) {
        return;
      }

      const studentToImport = this.#learners.find(
        ({ nationalStudentId }) => nationalStudentId === reconciledStudent.nationalStudentId,
      );

      if (!studentToImport) {
        return;
      }

      if (this.#shouldBeReconciled(allOrganizationLearnersInSameOrganization, reconciledStudent, studentToImport)) {
        studentToImport.userId = reconciledStudent.account.userId;
      }
    });

    return this.#learners;
  }

  #shouldBeReconciled(allOrganizationLearnersInSameOrganization, reconciledStudent, studentToImport) {
    const organizationLearnerWithSameUserId = allOrganizationLearnersInSameOrganization.find(
      (organizationLearnerInSameOrganization) =>
        organizationLearnerInSameOrganization.userId === reconciledStudent.account.userId,
    );
    const isOrganizationLearnerReconciled = organizationLearnerWithSameUserId != null;
    const organizationLearnerHasSameUserIdAndNationalStudentId =
      organizationLearnerWithSameUserId?.nationalStudentId === reconciledStudent.nationalStudentId;

    if (isOrganizationLearnerReconciled && !organizationLearnerHasSameUserIdAndNationalStudentId) {
      return false;
    }

    const isFromSameOrganization = studentToImport.organizationId === reconciledStudent.account.organizationId;
    const isFromDifferentOrganizationWithSameBirthday =
      !isFromSameOrganization && studentToImport.birthdate === reconciledStudent.account.birthdate;
    return isFromSameOrganization || isFromDifferentOrganizationWithSameBirthday;
  }

  get learners() {
    return this.#learners;
  }
}

export { ScoOrganizationLearnerSet };
