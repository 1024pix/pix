import * as serializer from '../../../../../../src/certification/results/infrastructure/serializers/parcoursup-certification-serializer.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Serializer | Json | parcoursup-certification-serializer', function () {
  describe('#serialize', function () {
    it('should serialize to Json', function () {
      // given
      const certificationResult = domainBuilder.certification.results.parcoursup.buildCertificationResult({
        ine: 'INE123',
        organizationUai: 'UAI ETAB ELEVE',
        lastName: 'NOM-ELEVE',
        firstName: 'PRENOM-ELEVE',
        birthdate: '2000-01-01',
        status: 'validated',
        pixScore: 327,
        certificationDate: new Date('2024-11-22T09:39:54Z'),
        competences: [
          domainBuilder.certification.results.parcoursup.buildCompetence({
            code: '1.1',
            name: 'Mener une recherche et une veille d’information',
            areaName: 'Informations et données',
            level: 3,
          }),
          domainBuilder.certification.results.parcoursup.buildCompetence({
            code: '1.2',
            name: 'Gérer des données',
            areaName: 'Informations et données',
            level: 5,
          }),
        ],
      });
      const translate = getI18n().__;

      // when
      const actualCertifiedProfileSerialized = serializer.serialize({
        certificationResult,
        translate,
      });

      // then
      return expect(actualCertifiedProfileSerialized).to.deep.equal({
        ...certificationResult,
        globalLevel: certificationResult.globalLevel.getLevelLabel(translate),
      });
    });
  });
});
