import { certificationController } from '../../../../../src/certification/results/application/certification-controller.js';
import { usecases } from '../../../../../src/certification/results/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';
import { getI18n } from '../../../../tooling/i18n/i18n.js';

describe('Certification | Results | Unit | Application | certifications-controller', function () {
  describe('#getCertificationByVerificationCode', function () {
    it('should return a serialized shareable certificate given by verification code', async function () {
      // given
      const request = { payload: { verificationCode: 'P-123456BB' } };
      const locale = 'fr-fr';
      const requestResponseUtilsStub = { extractLocaleFromRequest: sinon.stub() };
      const shareableCertificate = domainBuilder.buildShareableCertificate({
        id: 123,
        firstName: 'Dorothé',
        lastName: '2Pac',
        birthdate: '2000-01-01',
        birthplace: 'Sin City',
        isPublished: true,
        date: new Date('2020-01-01T00:00:00Z'),
        deliveredAt: new Date('2021-01-01T00:00:00Z'),
        certificationCenter: 'Centre des choux de Bruxelles',
        pixScore: 456,
        certifiedBadgeImages: ['/img/1'],
        maxReachableLevelOnCertificationDate: 6,
      });
      sinon.stub(usecases, 'getShareableCertificate');
      usecases.getShareableCertificate
        .withArgs({ verificationCode: 'P-123456BB', locale })
        .resolves(shareableCertificate);
      requestResponseUtilsStub.extractLocaleFromRequest.withArgs(request).returns(locale);

      // when
      const response = await certificationController.getCertificationByVerificationCode(request, hFake, {
        requestResponseUtils: requestResponseUtilsStub,
      });

      // then
      expect(response).to.deep.equal({
        data: {
          id: '123',
          type: 'certifications',
          attributes: {
            'first-name': 'Dorothé',
            'last-name': '2Pac',
            birthdate: '2000-01-01',
            birthplace: 'Sin City',
            'certification-center': 'Centre des choux de Bruxelles',
            date: new Date('2020-01-01T00:00:00Z'),
            'delivered-at': new Date('2021-01-01T00:00:00Z'),
            'is-published': true,
            'pix-score': 456,
            'certified-badge-images': ['/img/1'],
            'max-reachable-level-on-certification-date': 6,
          },
          relationships: {
            'result-competence-tree': {
              data: null,
            },
          },
        },
      });
    });
  });

  describe('#getCertification', function () {
    it('should return a serialized private certificate given by id', async function () {
      // given
      const userId = 1;
      const certificationId = 2;
      const request = {
        auth: { credentials: { userId } },
        params: { id: certificationId },
        i18n: getI18n(),
      };
      const locale = 'fr-fr';
      const requestResponseUtilsStub = { extractLocaleFromRequest: sinon.stub() };
      const privateCertificate = domainBuilder.buildPrivateCertificate.validated({
        id: certificationId,
        firstName: 'Dorothé',
        lastName: '2Pac',
        birthdate: '2000-01-01',
        birthplace: 'Sin City',
        isPublished: true,
        date: new Date('2020-01-01T00:00:00Z'),
        deliveredAt: new Date('2021-01-01T00:00:00Z'),
        certificationCenter: 'Centre des choux de Bruxelles',
        pixScore: 456,
        commentForCandidate: 'Cette personne est impolie !',
        certifiedBadgeImages: [],
        verificationCode: 'P-SUPERCODE',
        maxReachableLevelOnCertificationDate: 6,
      });
      sinon.stub(usecases, 'getPrivateCertificate');
      usecases.getPrivateCertificate.withArgs({ userId, certificationId, locale }).resolves(privateCertificate);
      requestResponseUtilsStub.extractLocaleFromRequest.withArgs(request).returns(locale);

      // when
      const response = await certificationController.getCertification(request, hFake, {
        requestResponseUtils: requestResponseUtilsStub,
      });

      // then
      expect(response).to.deep.equal({
        data: {
          id: '2',
          type: 'certifications',
          attributes: {
            'first-name': 'Dorothé',
            'last-name': '2Pac',
            birthdate: '2000-01-01',
            birthplace: 'Sin City',
            'certification-center': 'Centre des choux de Bruxelles',
            date: new Date('2020-01-01T00:00:00Z'),
            'delivered-at': new Date('2021-01-01T00:00:00Z'),
            'is-published': true,
            'pix-score': 456,
            status: 'validated',
            'comment-for-candidate': 'Cette personne est impolie !',
            'certified-badge-images': [],
            'verification-code': 'P-SUPERCODE',
            'max-reachable-level-on-certification-date': 6,
          },
          relationships: {
            'result-competence-tree': {
              data: null,
            },
          },
        },
      });
    });
  });

  describe('#findUserCertifications', function () {
    it('should return the serialized private certificates of the user', async function () {
      // given
      const userId = 1;
      const request = { auth: { credentials: { userId } }, i18n: getI18n() };
      const privateCertificate1 = domainBuilder.buildPrivateCertificate.validated({
        id: 123,
        firstName: 'Dorothé',
        lastName: '2Pac',
        birthdate: '2000-01-01',
        birthplace: 'Sin City',
        isPublished: true,
        date: new Date('2020-01-01T00:00:00Z'),
        deliveredAt: new Date('2021-01-01T00:00:00Z'),
        certificationCenter: 'Centre des choux de Bruxelles',
        pixScore: 456,
        commentForCandidate: 'Cette personne est impolie !',
        certifiedBadgeImages: [],
        verificationCode: 'P-SUPERCODE',
        maxReachableLevelOnCertificationDate: 6,
      });
      sinon.stub(usecases, 'findUserPrivateCertificates');
      usecases.findUserPrivateCertificates.withArgs({ userId }).resolves([privateCertificate1]);

      // when
      const response = await certificationController.findUserCertifications(request, hFake);

      // then
      expect(response).to.deep.equal({
        data: [
          {
            id: '123',
            type: 'certifications',
            attributes: {
              'first-name': 'Dorothé',
              'last-name': '2Pac',
              birthdate: '2000-01-01',
              birthplace: 'Sin City',
              'certification-center': 'Centre des choux de Bruxelles',
              date: new Date('2020-01-01T00:00:00Z'),
              'delivered-at': new Date('2021-01-01T00:00:00Z'),
              'is-published': true,
              'pix-score': 456,
              status: 'validated',
              'comment-for-candidate': 'Cette personne est impolie !',
              'certified-badge-images': [],
              'verification-code': 'P-SUPERCODE',
              'max-reachable-level-on-certification-date': 6,
            },
            relationships: {
              'result-competence-tree': {
                data: null,
              },
            },
          },
        ],
      });
    });
  });
});
