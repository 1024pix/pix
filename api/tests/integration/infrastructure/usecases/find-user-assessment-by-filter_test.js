const { expect, databaseBuilder } = require('../../../test-helper');

const assessmentRepository = require('../../../../lib/infrastructure/repositories/assessment-repository');
const findUserAssessmentByFilterUsecase = require('../../../../lib/domain/usecases/find-user-assessments-by-filters');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Integration | Infrastructure | Usecases | find-user-assessment-by-filter', () => {

  describe('When we ask for a certification', () => {

    context('when the assessment exists', () => {
      let certificationWanted;
      let assessmentWanted;
      let user;
      beforeEach(async () => {
        user = databaseBuilder.factory.buildUser();
        certificationWanted = databaseBuilder.factory.buildCertificationCourse();
        assessmentWanted = databaseBuilder.factory.buildAssessment({
          type: 'CERTIFICATION',
          courseId: certificationWanted.id,
          userId: user.id,
        });

        databaseBuilder.factory.buildAssessment({
          type: 'CERTIFICATION',
          userId: user.id,
        });
        databaseBuilder.factory.buildAssessment({
          type: 'CERTIFICATION'
        });
        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return only the certification asked', () => {
        // given
        const filters = {
          type: 'CERTIFICATION',
          courseId: certificationWanted.id,
        };

        // when
        const promise = findUserAssessmentByFilterUsecase({
          userId: user.id,
          filters,
          assessmentRepository
        });

        // then
        return promise.then((assessments) => {
          expect(assessments[0]).to.be.an.instanceOf(Assessment);
          expect(assessments[0].id).to.equal(assessmentWanted.id);
        });
      });
    });

  });
});
