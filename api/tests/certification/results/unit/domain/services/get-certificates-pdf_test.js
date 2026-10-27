import { expect } from 'chai';
import sinon from 'sinon';

import { getCertificatesPDF } from '../../../../../../src/certification/results/domain/services/get-certificates-pdf.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Results | Unit | Domain | Service | Get Certificates PDF', function () {
  describe('getCertificatesPDF', function () {
    let i18nStub, dependenciesStub;

    beforeEach(function () {
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

        // when
        await getCertificatesPDF({
          certificates: [certificate],
          i18n: i18nStub,
          dependencies: dependenciesStub,
        });

        // then
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

        // when
        await getCertificatesPDF({
          certificates: [certificate],
          i18n: i18nStub,
          isFrenchDomainExtension: true,
          dependencies: dependenciesStub,
        });

        // then

        expect(dependenciesStub.generateV2Pdf).calledOnceWithExactly({
          certificates: [certificate],
          i18n: i18nStub,
          isFrenchDomainExtension: true,
        });
      });
    });
  });
});
