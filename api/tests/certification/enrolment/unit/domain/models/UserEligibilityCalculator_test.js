import { LABEL_FOR_CORE } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityCalculator.js';
import { UserEligibilityList } from '../../../../../../src/certification/enrolment/domain/models/UserEligibilityList.js';
import { catchErrSync, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Unit | Certification | Enrolment | Domain | Models | UserEligibilityCalculator', function () {
  context('#computeCoreEligibility', function () {
    let coreCompetences;
    let allKnowledgeElements;
    beforeEach(function () {
      coreCompetences = [];
      coreCompetences.push(domainBuilder.buildCompetence({ id: 'compA' }));
      coreCompetences.push(domainBuilder.buildCompetence({ id: 'compB' }));
      coreCompetences.push(domainBuilder.buildCompetence({ id: 'compC' }));
      coreCompetences.push(domainBuilder.buildCompetence({ id: 'compD' }));
      coreCompetences.push(domainBuilder.buildCompetence({ id: 'compE' }));
      allKnowledgeElements = [];
      // competence A is certificable
      allKnowledgeElements.push(
        domainBuilder.buildKnowledgeElement({
          competenceId: 'compA',
          earnedPix: 2,
        }),
      );
      allKnowledgeElements.push(
        domainBuilder.buildKnowledgeElement({
          competenceId: 'compA',
          earnedPix: 3,
        }),
      );
      allKnowledgeElements.push(
        domainBuilder.buildKnowledgeElement({
          competenceId: 'compA',
          earnedPix: 4,
        }),
      );
      // competence B is certificable
      allKnowledgeElements.push(
        domainBuilder.buildKnowledgeElement({
          competenceId: 'compB',
          earnedPix: 12,
        }),
      );
      // competence C is certificable
      allKnowledgeElements.push(
        domainBuilder.buildKnowledgeElement({
          competenceId: 'compC',
          earnedPix: 7,
        }),
      );
      allKnowledgeElements.push(
        domainBuilder.buildKnowledgeElement({
          competenceId: 'compC',
          earnedPix: 1,
        }),
      );
      // competence D is certificable
      allKnowledgeElements.push(
        domainBuilder.buildKnowledgeElement({
          competenceId: 'compD',
          earnedPix: 25,
        }),
      );
    });

    context('for V2 AND V3 (same requirements)', function () {
      it('should compute core certificable as true when user is level 1 at 5 competences at least', function () {
        // given
        const someDate = new Date('2021-10-29');
        allKnowledgeElements.push(
          domainBuilder.buildKnowledgeElement({
            competenceId: 'compE',
            earnedPix: 2,
          }),
        );
        allKnowledgeElements.push(
          domainBuilder.buildKnowledgeElement({
            competenceId: 'compE',
            earnedPix: 2,
          }),
        );
        allKnowledgeElements.push(
          domainBuilder.buildKnowledgeElement({
            competenceId: 'compE',
            earnedPix: 2,
          }),
        );
        allKnowledgeElements.push(
          domainBuilder.buildKnowledgeElement({
            competenceId: 'compE',
            earnedPix: 2,
          }),
        );
        const userEligibilityCalculator = domainBuilder.certification.enrolment.buildUserEligibilityCalculator({
          userId: 123,
          date: someDate,
          eligibilities: [],
          eligibilitiesV2: [],
        });

        // when
        userEligibilityCalculator.computeCoreEligibility({ allKnowledgeElements, coreCompetences });

        // then
        expect(userEligibilityCalculator.toDTO()).to.deep.equal({
          userId: 123,
          date: someDate,
          eligibilities: [{ certification: LABEL_FOR_CORE, isCertifiable: true, isV2: false }],
          eligibilitiesV2: [{ certification: LABEL_FOR_CORE, isCertifiable: true, isV2: true }],
        });
      });

      it('should compute core certificable as false when user is level 1 on less than 5 competences', function () {
        // given
        const someDate = new Date('2021-10-29');
        // competence E
        allKnowledgeElements.push(
          domainBuilder.buildKnowledgeElement({
            competenceId: 'compE',
            earnedPix: 2,
          }),
        );
        const userEligibilityCalculator = domainBuilder.certification.enrolment.buildUserEligibilityCalculator({
          userId: 123,
          date: someDate,
          eligibilities: [],
          eligibilitiesV2: [],
        });

        // when
        userEligibilityCalculator.computeCoreEligibility({ allKnowledgeElements, coreCompetences });

        // then
        expect(userEligibilityCalculator.toDTO()).to.deep.equal({
          userId: 123,
          date: someDate,
          eligibilities: [{ certification: LABEL_FOR_CORE, isCertifiable: false, isV2: false }],
          eligibilitiesV2: [{ certification: LABEL_FOR_CORE, isCertifiable: false, isV2: true }],
        });
      });

      it('should compute core certifiable as false when user is level 1 on less than 5 competences (no KE in one competence)', function () {
        // given
        const someDate = new Date('2021-10-29');
        const userEligibilityCalculator = domainBuilder.certification.enrolment.buildUserEligibilityCalculator({
          userId: 123,
          date: someDate,
          eligibilities: [],
          eligibilitiesV2: [],
        });

        // when
        userEligibilityCalculator.computeCoreEligibility({ allKnowledgeElements, coreCompetences });

        // then
        expect(userEligibilityCalculator.toDTO()).to.deep.equal({
          userId: 123,
          date: someDate,
          eligibilities: [{ certification: LABEL_FOR_CORE, isCertifiable: false, isV2: false }],
          eligibilitiesV2: [{ certification: LABEL_FOR_CORE, isCertifiable: false, isV2: true }],
        });
      });
    });
  });

  context('#buildUserEligibilityList', function () {
    context('when computing is not done', function () {
      it('should throw an Error stating that computing is not done', function () {
        // given
        const someDate = new Date('2020-01-01');
        const userEligibilityCalculator = domainBuilder.certification.enrolment.buildUserEligibilityCalculator({
          userId: 123,
          date: someDate,
          eligibilities: [],
          eligibilitiesV2: [],
        });

        // when
        const error = catchErrSync(userEligibilityCalculator.buildUserEligibilityList, userEligibilityCalculator)();

        // then
        expect(error).to.be.instanceof(Error);
        expect(error.message).to.equal('Cannot produce final UserEligibilityList before computing them.');
      });

      it('should return a UserEligibilityList because computing is done', function () {
        // given
        const someDate = new Date('2020-01-01');
        const userEligibilityCalculator = domainBuilder.certification.enrolment.buildUserEligibilityCalculator({
          userId: 123,
          date: someDate,
          eligibilities: [],
          eligibilitiesV2: [],
        });
        userEligibilityCalculator.computeCoreEligibility({ allKnowledgeElements: [], coreCompetences: [] });

        // when
        const userEligibilityList = userEligibilityCalculator.buildUserEligibilityList();

        // then
        expect(userEligibilityList).to.be.instanceOf(UserEligibilityList);
        expect(userEligibilityList.toDTO()).to.deep.equal({
          userId: 123,
          date: someDate,
          eligibilities: [{ certification: LABEL_FOR_CORE, isCertifiable: false, isV2: false }],
          eligibilitiesV2: [{ certification: LABEL_FOR_CORE, isCertifiable: false, isV2: true }],
        });
      });
    });
  });

  context('#toDTO', function () {
    it('should return model as DTO', function () {
      // given
      const someDate = new Date('2020-01-01');
      const userEligibilityCalculator = domainBuilder.certification.enrolment.buildUserEligibilityCalculator({
        userId: 123,
        date: someDate,
        eligibilities: [
          domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true, isV2: false }),
        ],
        eligibilitiesV2: [
          domainBuilder.certification.enrolment.buildUserCoreEligibility({ isCertifiable: true, isV2: true }),
        ],
      });

      // when
      const DTO = userEligibilityCalculator.toDTO();

      // then
      expect(DTO).to.deep.equal({
        userId: 123,
        date: someDate,
        eligibilities: [{ certification: LABEL_FOR_CORE, isCertifiable: true, isV2: false }],
        eligibilitiesV2: [{ certification: LABEL_FOR_CORE, isCertifiable: true, isV2: true }],
      });
    });
  });
});
