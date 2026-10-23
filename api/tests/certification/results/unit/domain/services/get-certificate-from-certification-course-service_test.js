import { expect } from 'chai';
import sinon from 'sinon';

import { getCertificateFromCertificationCourseService } from '../../../../../../src/certification/results/domain/services/get-certificate-from-certification-course-services.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Results | Unit | Domain | Service | Get Certificate From Certification Course', function () {
  describe('#getCertificateFromCertificationCourseService', function () {
    let certificationCourseId, certificateRepositoryStub, i18nStub, dependenciesStub;

    beforeEach(function () {
      certificationCourseId = 12;

      certificateRepositoryStub = {
        getCertificate: sinon.stub(),
      };

      i18nStub = {
        getLocale: sinon.stub().returns('fr'),
        __: sinon.stub(),
      };

      dependenciesStub = {
        generateV2Pdf: sinon.stub(),
        generateV3Pdf: sinon.stub(),
      };
    });

    describe('when the certification is v3', function () {
      it('should call pdf generators', async function () {
        // given
        const certificate = domainBuilder.certification.results.buildCertificate();

        certificateRepositoryStub.getCertificate.resolves(certificate);

        // when
        await getCertificateFromCertificationCourseService({
          certificationCourseId,
          i18n: i18nStub,
          certificateRepository: certificateRepositoryStub,
          dependencies: dependenciesStub,
        });

        // then
        expect(certificateRepositoryStub.getCertificate).calledOnceWithExactly({
          certificationCourseId,
          locale: i18nStub.getLocale(),
        });
        expect(dependenciesStub.generateV3Pdf).calledOnceWithExactly({
          certificates: [certificate],
          i18n: i18nStub,
        });
      });
    });

    describe('when the certification is v2', function () {
      it('should call pdf generators', async function () {
        // given
        const certificate = domainBuilder.buildCertificationAttestation({
          version: AlgorithmEngineVersion.V2,
        });

        certificateRepositoryStub.getCertificate.resolves(certificate);

        // when
        await getCertificateFromCertificationCourseService({
          certificationCourseId,
          i18n: i18nStub,
          isFrenchDomainExtension: true,
          certificateRepository: certificateRepositoryStub,
          dependencies: dependenciesStub,
        });

        // then
        expect(certificateRepositoryStub.getCertificate).calledOnceWithExactly({
          certificationCourseId,
          locale: i18nStub.getLocale(),
        });
        expect(dependenciesStub.generateV2Pdf).calledOnceWithExactly({
          certificates: [certificate],
          i18n: i18nStub,
          isFrenchDomainExtension: true,
        });
      });
    });
  });
});
