import { Frameworks } from '../../../../../../src/certification/configuration/domain/models/Frameworks.js';
import {
  CERTIFICATE_STATUSES,
  CERTIFICATE_TYPES,
  EXTRA_CERTIFICATE_STATUSES,
} from '../../../../../../src/certification/results/domain/models/CertificateSummary.js';
import * as serializer from '../../../../../../src/certification/results/infrastructure/serializers/certificate-summary-serializer.js';
import { AutoJuryCommentKeys } from '../../../../../../src/certification/shared/domain/models/JuryComment.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Results | Unit | Infrastructure | Serializers | certificate-summary-serializer', function () {
  let translateFr, translateEn;
  let certificateSummaryData;

  beforeEach(function () {
    translateFr = getI18n('fr-FR').__;
    translateEn = getI18n('en-GB').__;
    certificateSummaryData = {
      id: 123,
      verificationCode: 'some verification code',
      certificationStartedAt: new Date('2021-10-29'),
      certificationFramework: Frameworks.CORE,
      certificationCenterName: 'some certification center',
      pixScore: 123,
      isExtraCertificationAcquired: true,
      status: CERTIFICATE_STATUSES.REJECTED,
      certificateType: CERTIFICATE_TYPES.CERTIFICATE,
      reachedMeshIndex: 1,
    };
  });

  describe('#serialize', function () {
    it('should serialize the certifiate summary and translate the juryComment in case of an auto jury comment', function () {
      // given
      const certificateSummary = domainBuilder.certification.results.buildCertificateSummary({
        ...certificateSummaryData,
        juryComment: domainBuilder.certification.shared.buildJuryComment.candidate({
          commentByAutoJury: AutoJuryCommentKeys.FRAUD,
          fallbackComment: null,
        }),
      });

      // when
      const serializedDataFr = serializer.serialize(certificateSummary, { translate: translateFr });
      const serializedDataEn = serializer.serialize(certificateSummary, { translate: translateEn });

      // then
      expect(serializedDataFr).to.deep.equal({
        data: {
          type: 'certificate-summaries',
          id: '123',
          attributes: {
            'verification-code': 'some verification code',
            'certification-center-name': 'some certification center',
            'certification-framework': Frameworks.CORE,
            'certification-started-at': new Date('2021-10-29'),
            'pix-score': 123,
            'certificate-type': CERTIFICATE_TYPES.CERTIFICATE,
            status: CERTIFICATE_STATUSES.REJECTED,
            'extra-certification-status': EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE,
            comment:
              "Les conditions de passation du test de certification n'ayant pas été respectées et ayant fait l'objet d'un signalement pour fraude, votre certification a été invalidée en conséquence.",
            'reached-mesh-index': 1,
          },
        },
      });
      expect(serializedDataEn).to.deep.equal({
        data: {
          type: 'certificate-summaries',
          id: '123',
          attributes: {
            'verification-code': 'some verification code',
            'certification-center-name': 'some certification center',
            'certification-framework': Frameworks.CORE,
            'certification-started-at': new Date('2021-10-29'),
            'pix-score': 123,
            'certificate-type': CERTIFICATE_TYPES.CERTIFICATE,
            status: CERTIFICATE_STATUSES.REJECTED,
            'extra-certification-status': EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE,
            comment:
              'The Pix certification exam conditions have not been respected. Your certification exam has been reported for fraud and has consequently been invalidated.',
            'reached-mesh-index': 1,
          },
        },
      });
    });

    it('should serialize the certifiate summary and not translate anything in case of specific comment', function () {
      // given
      const certificateSummary = domainBuilder.certification.results.buildCertificateSummary({
        ...certificateSummaryData,
        juryComment: domainBuilder.certification.shared.buildJuryComment.candidate({
          commentByAutoJury: null,
          fallbackComment: 'Message à tous les habitants de la galaxie, because it is la fiesta',
        }),
      });

      // when
      const serializedDataFr = serializer.serialize(certificateSummary, { translate: translateFr });
      const serializedDataEn = serializer.serialize(certificateSummary, { translate: translateEn });

      // then
      expect(serializedDataFr).to.deep.equal({
        data: {
          type: 'certificate-summaries',
          id: '123',
          attributes: {
            'verification-code': 'some verification code',
            'certification-center-name': 'some certification center',
            'certification-framework': Frameworks.CORE,
            'certification-started-at': new Date('2021-10-29'),
            'pix-score': 123,
            'certificate-type': CERTIFICATE_TYPES.CERTIFICATE,
            status: CERTIFICATE_STATUSES.REJECTED,
            'extra-certification-status': EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE,
            comment: 'Message à tous les habitants de la galaxie, because it is la fiesta',
            'reached-mesh-index': 1,
          },
        },
      });
      expect(serializedDataEn).to.deep.equal(serializedDataFr);
    });
  });
});
