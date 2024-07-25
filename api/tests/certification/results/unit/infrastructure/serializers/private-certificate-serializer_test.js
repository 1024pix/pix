import { ResultCompetenceTree } from '../../../../../../src/certification/results/domain/models/ResultCompetenceTree.js';
import * as serializer from '../../../../../../src/certification/results/infrastructure/serializers/private-certificate-serializer.js';
import { AutoJuryCommentKeys } from '../../../../../../src/certification/shared/domain/models/JuryComment.js';
import { ResultCompetence } from '../../../../../../src/shared/domain/models/ResultCompetence.js';
import { domainBuilder, expect } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

describe('Certification | Results | Unit | Infrastructure | Serializers | private-certificate-serializer', function () {
  let translate;
  let privateCertificateBase;

  beforeEach(function () {
    translate = getI18n().__;
    privateCertificateBase = {
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
      certifiedBadgeImages: ['/img/1', '/img/2'],
      verificationCode: 'P-SUPERCODE',
      maxReachableLevelOnCertificationDate: 6,
    };
  });

  describe('#serialize', function () {
    it('should serialize to JSON with included relationships', function () {
      // given
      const area1 = domainBuilder.buildArea({
        id: 'recAREA1',
        code: 1,
        name: 'Nom domaine 1',
        title: 'Titre domaine 1',
        color: 'violet',
      });
      const resultCompetence1 = new ResultCompetence({
        id: 'recCOMP1_1',
        index: '1.1',
        name: 'Nom compétence 1_1',
        level: -1,
        score: 0,
      });
      const resultCompetence2 = new ResultCompetence({
        id: 'recCOMP1_2',
        index: '1.2',
        name: 'Nom compétence 1_2',
        level: 3,
        score: 66,
      });
      area1.resultCompetences = [resultCompetence1, resultCompetence2];
      const resultCompetenceTree = new ResultCompetenceTree({
        id: '123-456',
        areas: [area1],
      });
      const privateCertificate = domainBuilder.buildPrivateCertificate.rejected({
        ...privateCertificateBase,
        resultCompetenceTree,
      });

      // when
      const serializedCertifications = serializer.serialize(privateCertificate, { translate });

      // then
      expect(serializedCertifications.data).to.deep.equal({
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
          status: 'rejected',
          'comment-for-candidate': 'Cette personne est impolie !',
          'certified-badge-images': ['/img/1', '/img/2'],
          'verification-code': 'P-SUPERCODE',
          'max-reachable-level-on-certification-date': 6,
        },
        relationships: {
          'result-competence-tree': {
            data: {
              id: '123-456',
              type: 'result-competence-trees',
            },
          },
        },
      });
      expect(serializedCertifications.included).to.deep.include.members([
        {
          id: '123-456',
          type: 'result-competence-trees',
          attributes: {
            id: '123-456',
          },
          relationships: {
            areas: {
              data: [
                {
                  id: 'recAREA1',
                  type: 'areas',
                },
              ],
            },
          },
        },
        {
          id: 'recAREA1',
          type: 'areas',
          attributes: {
            name: 'Nom domaine 1',
            title: 'Titre domaine 1',
            code: 1,
            color: 'violet',
          },
          relationships: {
            'result-competences': {
              data: [
                {
                  id: 'recCOMP1_1',
                  type: 'result-competences',
                },
                {
                  id: 'recCOMP1_2',
                  type: 'result-competences',
                },
              ],
            },
          },
        },
        {
          id: 'recCOMP1_1',
          type: 'result-competences',
          attributes: {
            name: 'Nom compétence 1_1',
            index: '1.1',
            level: -1,
            score: 0,
          },
        },
        {
          id: 'recCOMP1_2',
          type: 'result-competences',
          attributes: {
            name: 'Nom compétence 1_2',
            index: '1.2',
            level: 3,
            score: 66,
          },
        },
      ]);
    });

    it('should translate a commentForCandidate set by auto jury', function () {
      // given
      const privateCertificate = domainBuilder.buildPrivateCertificate({
        ...privateCertificateBase,
        commentByAutoJury: AutoJuryCommentKeys.FRAUD,
      });

      // when
      const serializedCertifications = serializer.serialize(privateCertificate, { translate });

      // then
      expect(serializedCertifications.data.attributes['comment-for-candidate']).to.equal(
        translate('jury.comment.FRAUD.candidate'),
      );
    });
  });
});
