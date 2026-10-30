import { expect } from 'chai';
import sinon from 'sinon';

import { getCertificatesPDF } from '../../../../../../src/certification/results/domain/services/get-certificates-pdf.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';

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

    describe('when the algorithm engine version is V3', function () {
      it('should call pdf generators for V3', async function () {
        // given
        const certificates = Symbol('some_certificates');

        // when
        await getCertificatesPDF({
          certificates,
          algorithmEngineVersion: AlgorithmEngineVersion.V3,
          i18n: i18nStub,
          dependencies: dependenciesStub,
        });

        // then
        expect(dependenciesStub.generateV3Pdf).calledOnceWithExactly({
          certificates,
          i18n: i18nStub,
        });
      });
    });

    describe('when the algorithm engine version is not V3', function () {
      it('should call pdf generators for V2', async function () {
        // given
        const certificates = Symbol('some_certificates');

        // when
        await getCertificatesPDF({
          certificates,
          algorithmEngineVersion: AlgorithmEngineVersion.V2,
          i18n: i18nStub,
          isFrenchDomainExtension: true,
          dependencies: dependenciesStub,
        });

        // then

        expect(dependenciesStub.generateV2Pdf).calledOnceWithExactly({
          certificates,
          i18n: i18nStub,
          isFrenchDomainExtension: true,
        });
      });
    });
  });
});
