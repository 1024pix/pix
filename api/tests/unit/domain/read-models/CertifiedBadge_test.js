import ComplementaryCertificationCourseResult from '../../../../lib/domain/models/ComplementaryCertificationCourseResult';
import CertifiedBadge from '../../../../lib/domain/read-models/CertifiedBadge';
import { expect } from '../../../test-helper';

describe('Unit | Domain | Read-models | CertifiedBadge', function () {
  describe('#getAcquiredCertifiedBadgesDTO', function () {
    context('when badge has no external jury', function () {
      context('when badge is not acquired', function () {
        it('should return an empty array', function () {
          // given
          const complementaryCertificationCourseResults = [
            {
              acquired: false,
              partnerKey: 'PIX_TEST',
              hasExternalJury: false,
            },
          ];
          // when
          const certifiedBadgesDTO = CertifiedBadge.fromComplementaryCertificationCourseResults(
            complementaryCertificationCourseResults
          );

          // then
          expect(certifiedBadgesDTO).to.be.empty;
        });
      });

      context('when badge is acquired', function () {
        it(`returns a non temporary acquired badge`, function () {
          // given
          const complementaryCertificationCourseResults = [
            {
              complementaryCertificationCourseId: 456,
              partnerKey: 'PIX_TEST',
              acquired: true,
              label: 'Pix+ Test',
              hasExternalJury: false,
              imageUrl: 'https://wwww.pix-badge-image-url.com',
              stickerUrl: 'https://wwww.pix-sticker-url.com',
            },
          ];

          // when
          const certifiedBadgesDTO = CertifiedBadge.fromComplementaryCertificationCourseResults(
            complementaryCertificationCourseResults
          );

          // then
          expect(certifiedBadgesDTO).to.deepEqualArray([
            new CertifiedBadge({
              partnerKey: 'PIX_TEST',
              isTemporaryBadge: false,
              label: 'Pix+ Test',
              imageUrl: 'https://wwww.pix-badge-image-url.com',
              stickerUrl: 'https://wwww.pix-sticker-url.com',
              message: undefined,
            }),
          ]);
        });
      });
    });

    context('when badge has external jury', function () {
      context('when there is only one complementary certification course result', function () {
        it(`returns a temporary badge`, function () {
          // given
          const complementaryCertificationCourseResults = [
            {
              complementaryCertificationCourseId: 456,
              partnerKey: 'PIX_TEST',
              label: 'Pix+ Test',
              acquired: true,
              source: ComplementaryCertificationCourseResult.sources.PIX,
              hasExternalJury: true,
              imageUrl: 'https://wwww.pix-badge-image-url.com',
              stickerUrl: 'https://wwww.pix-sticker-url.com',
              temporaryCertificateMessage: 'You temporarily acquired this magnificent badge',
            },
          ];

          // when
          const certifiedBadgesDTO = CertifiedBadge.fromComplementaryCertificationCourseResults(
            complementaryCertificationCourseResults
          );

          // then
          expect(certifiedBadgesDTO).to.deepEqualArray([
            new CertifiedBadge({
              partnerKey: 'PIX_TEST',
              isTemporaryBadge: true,
              label: 'Pix+ Test',
              imageUrl: 'https://wwww.pix-badge-image-url.com',
              stickerUrl: 'https://wwww.pix-sticker-url.com',
              message: 'You temporarily acquired this magnificent badge',
            }),
          ]);
        });

        it(`returns an empty array for non acquired badge`, function () {
          // given
          const complementaryCertificationCourseResults = [
            new CertifiedBadge({
              complementaryCertificationCourseId: 456,
              partnerKey: 'PIX_TEST',
              source: ComplementaryCertificationCourseResult.sources.PIX,
              acquired: false,
              hasExternalJury: true,
            }),
          ];

          // when
          const certifiedBadgesDTO = CertifiedBadge.fromComplementaryCertificationCourseResults(
            complementaryCertificationCourseResults
          );

          // then
          expect(certifiedBadgesDTO).to.deepEqualArray([]);
        });
      });

      context('when there is more than one complementary certification course result', function () {
        describe('when there is an "EXTERNAL" and acquired badge', function () {
          it(`returns a non temporary badge`, function () {
            // given
            const complementaryCertificationCourseResult = {
              complementaryCertificationCourseId: 456,
              partnerKey: 'PIX_TEST',
              label: 'Pix+ Test',
              level: 3,
              source: ComplementaryCertificationCourseResult.sources.PIX,
              acquired: true,
              hasExternalJury: true,
              imageUrl: 'https://wwww.pix-badge-image-url.com',
              stickerUrl: 'https://wwww.pix-sticker-url.com',
              certificateMessage: 'Vous avez obtenu la certification, wunderbar',
              temporaryCertificateMessage: 'NOT ME',
            };

            const complementaryCertificationCourseResults = [
              {
                ...complementaryCertificationCourseResult,
                source: ComplementaryCertificationCourseResult.sources.PIX,
              },
              {
                ...complementaryCertificationCourseResult,
                source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
              },
            ];

            // when
            const certifiedBadgesDTO = CertifiedBadge.fromComplementaryCertificationCourseResults(
              complementaryCertificationCourseResults
            );

            // then
            expect(certifiedBadgesDTO).to.deepEqualArray([
              new CertifiedBadge({
                partnerKey: 'PIX_TEST',
                isTemporaryBadge: false,
                label: 'Pix+ Test',
                imageUrl: 'https://wwww.pix-badge-image-url.com',
                stickerUrl: 'https://wwww.pix-sticker-url.com',
                message: 'Vous avez obtenu la certification, wunderbar',
              }),
            ]);
          });
        });

        describe('when there is an "EXTERNAL" and not acquired badge', function () {
          it(`returns an empty array`, function () {
            // given
            const complementaryCertificationCourseResults = [
              {
                complementaryCertificationCourseId: 456,
                partnerKey: 'PIX_TEST',
                label: 'Pix+ Test',
                level: 2,
                source: ComplementaryCertificationCourseResult.sources.PIX,
                acquired: true,
                hasExternalJury: true,
              },
              {
                complementaryCertificationCourseId: 456,
                partnerKey: 'PIX_TEST',
                label: 'Pix+ Test',
                level: 2,
                source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
                acquired: false,
                hasExternalJury: true,
              },
            ];

            // when
            const certifiedBadgesDTO = CertifiedBadge.fromComplementaryCertificationCourseResults(
              complementaryCertificationCourseResults
            );

            // then
            expect(certifiedBadgesDTO).to.deepEqualArray([]);
          });
        });

        it(`should return the complementary certification course result with the lowest level`, function () {
          // given
          const complementaryCertificationCourseResults = [
            {
              partnerKey: 'PIX_TEST_2',
              label: 'Pix+ Test 2',
              level: 4,
              complementaryCertificationCourseId: 456,
              source: ComplementaryCertificationCourseResult.sources.PIX,
              acquired: true,
              hasExternalJury: true,
              imageUrl: 'https://wwww.pix-badge-image-url2.com',
              stickerUrl: 'https://wwww.pix-sticker-url2.com',
              certificateMessage: 'XXX Vous avez obtenu la certification, wunderbar',
              temporaryCertificateMessage: 'XXX NOT ME',
            },
            {
              partnerKey: 'PIX_TEST_1',
              label: 'Pix+ Test 1',
              level: 2,
              complementaryCertificationCourseId: 456,
              source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
              acquired: true,
              hasExternalJury: true,
              imageUrl: 'https://wwww.pix-badge-image-url1.com',
              stickerUrl: 'https://wwww.pix-sticker-url1.com',
              certificateMessage: 'Vous avez obtenu la certification, wunderbar',
              temporaryCertificateMessage: 'NOT ME',
            },
          ];

          // when
          const certifiedBadgesDTO = CertifiedBadge.fromComplementaryCertificationCourseResults(
            complementaryCertificationCourseResults
          );

          // then
          expect(certifiedBadgesDTO).to.deepEqualArray([
            new CertifiedBadge({
              partnerKey: 'PIX_TEST_1',
              label: 'Pix+ Test 1',
              isTemporaryBadge: false,
              imageUrl: 'https://wwww.pix-badge-image-url1.com',
              stickerUrl: 'https://wwww.pix-sticker-url1.com',
              message: 'Vous avez obtenu la certification, wunderbar',
            }),
          ]);
        });
      });
    });
  });
});
