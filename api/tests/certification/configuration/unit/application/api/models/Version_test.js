import { Version } from '../../../../../../../src/certification/configuration/application/api/models/Version.js';
import { Frameworks } from '../../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Unit | Application | Api | Models | Version', function () {
  let baseVersion, proxyVersion;

  beforeEach(function () {
    baseVersion = domainBuilder.certification.configuration.buildVersion({
      id: 4,
      scope: Frameworks.CORE,
      startDate: new Date('2025-02-02'),
      expirationDate: new Date('2025-12-01'),
      assessmentDuration: 4,
      minimumAnswersRequiredToValidateACertification: 4,
      globalScoringConfiguration: [{ config: 'core2025' }],
      competencesScoringConfiguration: [{ config: 'core2025' }],
      challengesConfiguration: {
        maximumAssessmentLength: 4,
        challengesBetweenSameCompetence: 4,
        limitToOneQuestionPerTube: false,
        enablePassageByAllCompetences: true,
        variationPercent: 0.4,
        defaultCandidateCapacity: 4,
        defaultProbabilityToPickChallenge: 4,
      },
    });
    proxyVersion = new Version(baseVersion);
  });

  describe('#get id', function () {
    it('returns id and prevent from altering the base version', function () {
      expect(proxyVersion.id).to.equal(baseVersion.id);
      expect(() => {
        proxyVersion.id = 99;
      }).to.throw(TypeError, /Cannot set property id/);
    });
  });

  describe('#get scope', function () {
    it('returns scope and prevent from altering the base version', function () {
      expect(proxyVersion.scope).to.equal(baseVersion.scope);
      expect(() => {
        proxyVersion.scope = 'COUCOU';
      }).to.throw(TypeError, /Cannot set property scope/);
    });
  });

  describe('#get startDate', function () {
    it('returns startDate and prevent from altering the base version', function () {
      expect(proxyVersion.startDate).to.deep.equal(baseVersion.startDate);
      expect(() => {
        proxyVersion.startDate = new Date();
      }).to.throw(TypeError, /Cannot set property startDate/);
    });

    it('returns null when base version start date is null', function () {
      baseVersion.startDate = null;
      expect(proxyVersion.startDate).to.be.null;
      expect(proxyVersion.startDate).to.deep.equal(baseVersion.startDate);
    });
  });

  describe('#get expirationDate', function () {
    it('returns expirationDate and prevent from altering the base version', function () {
      expect(proxyVersion.expirationDate).to.deep.equal(baseVersion.expirationDate);
      expect(() => {
        proxyVersion.expirationDate = new Date();
      }).to.throw(TypeError, /Cannot set property expirationDate/);
    });

    it('returns null when base version expirationDate is null', function () {
      baseVersion.expirationDate = null;
      expect(proxyVersion.expirationDate).to.be.null;
      expect(proxyVersion.expirationDate).to.deep.equal(baseVersion.expirationDate);
    });
  });

  describe('#get assessmentDuration', function () {
    it('returns assessmentDuration and prevent from altering the base version', function () {
      expect(proxyVersion.assessmentDuration).to.deep.equal(baseVersion.assessmentDuration);
      expect(() => {
        proxyVersion.assessmentDuration = 999999;
      }).to.throw(TypeError, /Cannot set property assessmentDuration/);
    });
  });

  describe('#get minimumAnswersRequiredToValidateACertification', function () {
    it('returns minimumAnswersRequiredToValidateACertification and prevent from altering the base version', function () {
      expect(proxyVersion.minimumAnswersRequiredToValidateACertification).to.deep.equal(
        baseVersion.minimumAnswersRequiredToValidateACertification,
      );
      expect(() => {
        proxyVersion.minimumAnswersRequiredToValidateACertification = 999999;
      }).to.throw(TypeError, /Cannot set property minimumAnswersRequiredToValidateACertification/);
    });
  });

  describe('#get globalScoringConfiguration', function () {
    it('returns globalScoringConfiguration and prevent from altering the base version', function () {
      expect(proxyVersion.globalScoringConfiguration).to.deep.equal(baseVersion.globalScoringConfiguration);
      expect(() => {
        proxyVersion.globalScoringConfiguration = { foo: 'bar' };
      }).to.throw(TypeError, /Cannot set property globalScoringConfiguration/);
    });
  });

  describe('#get competencesScoringConfiguration', function () {
    it('returns competencesScoringConfiguration and prevent from altering the base version', function () {
      expect(proxyVersion.competencesScoringConfiguration).to.deep.equal(baseVersion.competencesScoringConfiguration);
      expect(() => {
        proxyVersion.competencesScoringConfiguration = { foo: 'bar' };
      }).to.throw(TypeError, /Cannot set property competencesScoringConfiguration/);
    });
  });

  describe('#get challengesConfiguration', function () {
    it('returns challengesConfiguration and prevent from altering the base version', function () {
      expect(proxyVersion.challengesConfiguration).to.deep.equal(baseVersion.challengesConfiguration);
      expect(() => {
        proxyVersion.challengesConfiguration = { foo: 'bar' };
      }).to.throw(TypeError, /Cannot set property challengesConfiguration/);
    });
  });
});
