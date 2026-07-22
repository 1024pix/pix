import sinon from 'sinon';

import { ActiveCertificationInfoNotFound } from '../../../../../../src/certification/configuration/domain/errors.js';
import { getInfo } from '../../../../../../src/certification/configuration/domain/usecases/get-info.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Configuration | Unit | UseCase | get-info', function () {
  let certificationInfoRepository, framework;

  beforeEach(function () {
    certificationInfoRepository = {
      findAllByFramework: sinon.stub(),
    };
    framework = Frameworks.EDU_2ND_DEGRE;
  });

  context('when framework has no active version', function () {
    it('throws a ActiveCertificationInfoNotFound', async function () {
      certificationInfoRepository.findAllByFramework.withArgs(framework).resolves([
        domainBuilder.certification.configuration
          .certificationInfoBuilder()
          .asDraft()
          .withParameters({
            framework: Frameworks.EDU_2ND_DEGRE,
            assessmentDuration: 200,
            minimumAssessmentLength: 10,
            maximumAssessmentLength: 20,
          })
          .build(),
        domainBuilder.certification.configuration
          .certificationInfoBuilder()
          .asArchived()
          .withParameters({
            framework: Frameworks.EDU_2ND_DEGRE,
            assessmentDuration: 200,
            minimumAssessmentLength: 10,
            maximumAssessmentLength: 20,
          })
          .build(),
      ]);

      const err = await catchErr(getInfo)({ framework, certificationInfoRepository });

      expect(err).to.deepEqualInstance(new ActiveCertificationInfoNotFound(framework));
    });
  });

  context('when framework has an active version', function () {
    it('returns the certification info model for the active version', async function () {
      const activeCertificationInfo = domainBuilder.certification.configuration
        .certificationInfoBuilder()
        .asActive()
        .withParameters({
          framework: Frameworks.EDU_2ND_DEGRE,
          startDate: null,
          expirationDate: null,
          assessmentDuration: 200,
          minimumAssessmentLength: 10,
          maximumAssessmentLength: 20,
        })
        .build();
      certificationInfoRepository.findAllByFramework.withArgs(framework).resolves([
        activeCertificationInfo,
        domainBuilder.certification.configuration
          .certificationInfoBuilder()
          .asDraft()
          .withParameters({
            framework: Frameworks.EDU_2ND_DEGRE,
            startDate: new Date('2021-01-01'),
            expirationDate: null,
            assessmentDuration: 33,
            minimumAssessmentLength: 11,
            maximumAssessmentLength: 22,
          })
          .build(),
      ]);

      const certificationInfo = await getInfo({ framework, certificationInfoRepository });

      expect(certificationInfo).to.deepEqualInstance(activeCertificationInfo);
    });
  });
});
