import { expect, domainBuilder } from '../../../test-helper.js';
import { PrivateCertificate } from '../../../../lib/domain/models/PrivateCertificate.js';
import { status as assessmentResultStatuses } from '../../../../src/shared/domain/models/AssessmentResult.js';

describe('Unit | Domain | Models | PrivateCertificate', function () {
  context('#static buildFrom', function () {
    const commonData = {
      id: 1,
      firstName: 'Jean',
      lastName: 'Bon',
      birthdate: '2000-03-20',
      birthplace: 'Sarajevo',
      isPublished: true,
      userId: 123,
      date: '2019-01-01',
      deliveredAt: new Date('2019-05-05'),
      certificationCenter: 'Centre des fruits et légumes',
      pixScore: 250,
      commentForCandidate: 'Bravo !',
      certifiedBadgeImages: [],
      resultCompetenceTree: null,
      verificationCode: 'someVerifCode',
      maxReachableLevelOnCertificationDate: 5,
    };

    it('builds a cancelled PrivateCertificate', async function () {
      // when
      const privateCertificate = PrivateCertificate.buildFrom({ ...commonData, isCancelled: true });

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.cancelled(commonData);
      expect(privateCertificate).to.be.instanceOf(PrivateCertificate);
      expect(privateCertificate).to.deep.equal(expectedPrivateCertificate);
    });

    it('builds a validated PrivateCertificate', async function () {
      // when
      const privateCertificate = PrivateCertificate.buildFrom({
        ...commonData,
        isCancelled: false,
        assessmentResultStatus: assessmentResultStatuses.VALIDATED,
      });

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.validated(commonData);
      expect(privateCertificate).to.be.instanceOf(PrivateCertificate);
      expect(privateCertificate).to.deep.equal(expectedPrivateCertificate);
    });

    it('builds a rejected PrivateCertificate', async function () {
      // when
      const privateCertificate = PrivateCertificate.buildFrom({
        ...commonData,
        isCancelled: false,
        assessmentResultStatus: assessmentResultStatuses.REJECTED,
      });

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.rejected(commonData);
      expect(privateCertificate).to.be.instanceOf(PrivateCertificate);
      expect(privateCertificate).to.deep.equal(expectedPrivateCertificate);
    });

    it('builds an error PrivateCertificate', async function () {
      // when
      const privateCertificate = PrivateCertificate.buildFrom({
        ...commonData,
        isCancelled: false,
        assessmentResultStatus: assessmentResultStatuses.ERROR,
      });

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.error(commonData);
      expect(privateCertificate).to.be.instanceOf(PrivateCertificate);
      expect(privateCertificate).to.deep.equal(expectedPrivateCertificate);
    });

    it('builds a started PrivateCertificate', async function () {
      // when
      const privateCertificate = PrivateCertificate.buildFrom({
        ...commonData,
        isCancelled: false,
        assessmentResultStatus: null,
      });

      // then
      const expectedPrivateCertificate = domainBuilder.buildPrivateCertificate.started(commonData);
      expect(privateCertificate).to.be.instanceOf(PrivateCertificate);
      expect(privateCertificate).to.deep.equal(expectedPrivateCertificate);
    });
  });

  context('#setResultCompetenceTree', function () {
    it('should set the resultCompetenceTree on PrivateCertificate model', function () {
      // given
      const resultCompetenceTree = domainBuilder.buildResultCompetenceTree({ id: 'someId' });
      const privateCertificate = domainBuilder.buildPrivateCertificate();

      // when
      privateCertificate.setResultCompetenceTree(resultCompetenceTree);

      // expect
      expect(privateCertificate.resultCompetenceTree).to.deep.equal(resultCompetenceTree);
    });
  });
});
