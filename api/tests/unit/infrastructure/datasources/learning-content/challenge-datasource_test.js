import _ from 'lodash';
import { expect, sinon, catchErr } from '../../../../test-helper.js';
import { lcms } from '../../../../../lib/infrastructure/lcms.js';
import { challengeDatasource } from '../../../../../lib/infrastructure/datasources/learning-content/challenge-datasource.js';
import { learningContentCache } from '../../../../../lib/infrastructure/caches/learning-content-cache.js';
import { LearningContentResourceNotFound } from '../../../../../lib/infrastructure/datasources/learning-content/LearningContentResourceNotFound.js';

describe('Unit | Infrastructure | Datasource | Learning Content | ChallengeDatasource', function () {
  let competence1,
    competence2,
    web1,
    web2,
    web3,
    challenge_competence1,
    challenge_competence1_noSkills,
    challenge_competence1_notValidated,
    challenge_competence1_obsolete,
    challenge_competence2,
    challenge_web1,
    challenge_web1_notValidated,
    challenge_web1_archived,
    challenge_web2_en,
    challenge_web3,
    challenge_web3_archived;

  beforeEach(function () {
    competence1 = { id: 'competence1' };
    competence2 = { id: 'competence2' };
    web1 = { id: 'skill-web1' };
    web2 = { id: 'skill-web2' };
    web3 = { id: 'skill-web3' };
    challenge_competence1 = {
      id: 'challenge-competence1',
      competenceId: competence1.id,
      skillId: web1.id,
      status: 'validé',
      locales: ['fr', 'fr-fr'],
      alpha: 2.11,
      delta: -3.56,
    };
    challenge_competence1_noSkills = {
      id: 'challenge-competence1-noSkills',
      competenceId: competence1.id,
      skillId: undefined,
      status: 'validé',
      locales: ['fr', 'fr-fr'],
      alpha: 8.11,
      delta: 0.95,
    };
    challenge_competence1_notValidated = {
      id: 'challenge-competence1-notValidated',
      competenceId: competence1.id,
      skillId: web1.id,
      locales: ['fr', 'fr-fr'],
      status: 'proposé',
      alpha: -0,
      delta: 0,
    };

    challenge_competence1_obsolete = {
      id: 'challenge-competence1-obsolete',
      competenceId: competence1.id,
      skillId: web1.id,
      locales: ['fr', 'fr-fr'],
      status: 'périmé',
      alpha: -0,
      delta: 0,
    };

    challenge_competence2 = {
      id: 'challenge-competence2',
      competenceId: competence2.id,
      skillId: web1.id,
      status: 'validé',
      locales: ['fr', 'fr-fr'],
      alpha: 8.21,
      delta: -4.23,
    };
    challenge_web1 = {
      id: 'challenge-web1',
      skillId: web1.id,
      locales: ['fr', 'fr-fr'],
      status: 'validé',
    };
    challenge_web1_notValidated = {
      id: 'challenge-web1-notValidated',
      skillId: web1.id,
      status: 'proposé',
      locales: ['fr', 'fr-fr'],
    };
    challenge_web1_archived = {
      id: 'challenge_web1_archived',
      skillId: web1.id,
      status: 'archivé',
      locales: ['fr', 'fr-fr'],
    };
    challenge_web2_en = {
      id: 'challenge-web2',
      skillId: web2.id,
      locales: ['en'],
      status: 'validé',
      alpha: 1,
      delta: -2,
    };
    challenge_web3 = {
      id: 'challenge-web3',
      skillId: web3.id,
      status: 'validé',
      locales: ['fr', 'fr-fr'],
      alpha: 1.83,
      delta: 0.27,
    };
    challenge_web3_archived = {
      id: 'challenge-web3-archived',
      skillId: web3.id,
      status: 'archivé',
      locales: ['fr-fr'],
      alpha: -8.1,
      delta: 0,
    };

    sinon.stub(learningContentCache, 'get').callsFake((generator) => generator());
  });

  describe('#findOperativeBySkillIds', function () {
    beforeEach(function () {
      sinon
        .stub(lcms, 'getLatestRelease')
        .resolves({ challenges: [challenge_web1, challenge_web1_notValidated, challenge_web2_en, challenge_web3] });
    });

    it('should resolve an array of matching Challenges from learning content', async function () {
      // given
      const skillIds = ['skill-web1', 'skill-web2'];

      // when
      const result = await challengeDatasource.findOperativeBySkillIds(skillIds);

      // then
      expect(lcms.getLatestRelease).to.have.been.called;
      expect(_.map(result, 'id')).to.deep.equal(['challenge-web1', 'challenge-web2']);
    });
  });

  describe('#findValidatedByCompetenceId', function () {
    let result;

    beforeEach(async function () {
      // given
      sinon.stub(lcms, 'getLatestRelease').resolves({
        challenges: [
          challenge_competence1,
          challenge_competence1_noSkills,
          challenge_competence1_notValidated,
          challenge_competence2,
        ],
      });

      // when
      result = await challengeDatasource.findValidatedByCompetenceId(competence1.id);
    });

    it('should resolve to an array of matching Challenges from learning content', function () {
      // then
      expect(lcms.getLatestRelease).to.have.been.called;
      expect(_.map(result, 'id')).to.deep.equal(['challenge-competence1']);
    });
  });

  describe('#findOperative', function () {
    beforeEach(function () {
      sinon.stub(lcms, 'getLatestRelease').resolves({
        challenges: [challenge_web1, challenge_web1_notValidated, challenge_web2_en, challenge_web3_archived],
      });
    });

    it('should resolve an array of matching Challenges from learning content', async function () {
      // when
      const result = await challengeDatasource.findOperative();

      // then
      expect(lcms.getLatestRelease).to.have.been.called;
      expect(_.map(result, 'id')).to.deep.equal(['challenge-web1', 'challenge-web2', 'challenge-web3-archived']);
    });
  });

  describe('#findOperativeHavingLocale', function () {
    it('should retrieve the operative Challenges of given locale only', async function () {
      // given
      const locale = 'fr-fr';
      sinon.stub(lcms, 'getLatestRelease').resolves({
        challenges: [challenge_web1, challenge_web1_notValidated, challenge_web2_en, challenge_web3_archived],
      });

      // when
      const result = await challengeDatasource.findOperativeHavingLocale(locale);

      // then
      expect(_.map(result, 'id')).to.deep.equal(['challenge-web1', 'challenge-web3-archived']);
    });
  });

  describe('#findValidated', function () {
    beforeEach(function () {
      sinon.stub(lcms, 'getLatestRelease').resolves({
        challenges: [challenge_web1, challenge_web1_notValidated, challenge_web2_en, challenge_web3_archived],
      });
    });

    it('should resolve an array of matching Challenges from learning content', async function () {
      // when
      const result = await challengeDatasource.findValidated();

      // then
      expect(lcms.getLatestRelease).to.have.been.called;
      expect(_.map(result, 'id')).to.deep.equal(['challenge-web1', 'challenge-web2']);
    });
  });

  describe('#findFlashCompatible', function () {
    beforeEach(function () {
      sinon.stub(lcms, 'getLatestRelease').resolves({
        challenges: [
          challenge_competence1,
          challenge_competence1_notValidated,
          challenge_competence1_noSkills,
          challenge_competence1_obsolete,
          challenge_competence2,
          challenge_web1,
          challenge_web1_notValidated,
          challenge_web2_en,
          challenge_web3,
          challenge_web3_archived,
        ],
      });
    });

    context('when not requesting obsolete challenges', function () {
      it('should resolve an array of matching Challenges from learning content', async function () {
        // when
        const locale = 'fr-fr';
        const result = await challengeDatasource.findFlashCompatible({ locale });

        // then
        expect(lcms.getLatestRelease).to.have.been.called;
        expect(_.map(result, 'id').sort()).to.deep.equal(
          [challenge_competence1.id, challenge_competence2.id, challenge_web3.id, challenge_web3_archived.id].sort(),
        );
      });
    });

    context('when requesting obsolete challenges', function () {
      it('should resolve an array of matching Challenges from learning content', async function () {
        // when
        const locale = 'fr-fr';
        const result = await challengeDatasource.findFlashCompatible({ locale, useObsoleteChallenges: true });

        // then
        expect(lcms.getLatestRelease).to.have.been.called;
        expect(_.map(result, 'id').sort()).to.deep.equal(
          [
            challenge_competence1.id,
            challenge_competence1_obsolete.id,
            challenge_competence2.id,
            challenge_web3.id,
            challenge_web3_archived.id,
          ].sort(),
        );
      });
    });
  });

  describe('#findActiveFlashCompatible', function () {
    beforeEach(function () {
      sinon.stub(lcms, 'getLatestRelease').resolves({
        challenges: [
          challenge_competence1,
          challenge_competence1_noSkills,
          challenge_competence2,
          challenge_web1,
          challenge_web1_notValidated,
          challenge_web2_en,
          challenge_web3,
          challenge_web3_archived,
        ],
      });
    });

    it('should resolve an array of matching Challenges from learning content', async function () {
      // when
      const locale = 'fr-fr';
      const result = await challengeDatasource.findActiveFlashCompatible(locale);

      // then
      expect(lcms.getLatestRelease).to.have.been.called;
      expect(_.map(result, 'id')).to.deep.equal([
        challenge_competence1.id,
        challenge_competence2.id,
        challenge_web3.id,
      ]);
    });
  });

  describe('#findOperativeFlashCompatible', function () {
    beforeEach(function () {
      sinon.stub(lcms, 'getLatestRelease').resolves({
        challenges: [
          challenge_competence1,
          challenge_competence1_noSkills,
          challenge_competence2,
          challenge_web1,
          challenge_web1_notValidated,
          challenge_web2_en,
          challenge_web3,
          challenge_web3_archived,
        ],
      });
    });

    it('should resolve an array of matching Challenges from learning content', async function () {
      // when
      const locale = 'fr-fr';
      const result = await challengeDatasource.findOperativeFlashCompatible(locale);

      // then
      expect(lcms.getLatestRelease).to.have.been.called;
      expect(_.map(result, 'id')).to.deep.equal([
        challenge_competence1.id,
        challenge_competence2.id,
        challenge_web3.id,
        challenge_web3_archived.id,
      ]);
    });
  });

  describe('#findValidatedBySkillId', function () {
    beforeEach(function () {
      sinon.stub(lcms, 'getLatestRelease').resolves({
        challenges: [challenge_web1, challenge_web1_notValidated, challenge_web1_archived, challenge_competence2],
      });
    });
    it('should resolve an array of validated challenge of a skill from learning content ', async function () {
      // when
      const result = await challengeDatasource.findValidatedBySkillId('skill-web1');

      // then
      expect(lcms.getLatestRelease).to.have.been.called;
      expect(result).to.deep.equal([challenge_web1, challenge_competence2]);
    });
  });

  describe('#getBySkillId', function () {
    let validated_challenge_pix1d;
    let proposed_challenge_pix1d;
    let obsolete_challenge_pix1d;

    const skillId = '@didacticiel1';
    beforeEach(function () {
      validated_challenge_pix1d = {
        id: 'challenge-competence1',
        competenceId: competence1.id,
        skillId,
        status: 'validé',
      };
      proposed_challenge_pix1d = {
        id: 'challenge-competence2',
        competenceId: competence1.id,
        status: 'proposé',
        skillId,
      };
      obsolete_challenge_pix1d = {
        id: 'challenge-competence3',
        competenceId: competence1.id,
        status: 'périmé',
        skillId,
      };
    });

    context('when there are several challenges for the skillId', function () {
      // it('should return a challenge randomly if the alternativeVersion is not provided', async function () {
      //   // when
      //   sinon.stub(lcms, 'getLatestRelease').resolves({
      //     challenges: [challenge_web1, challenge_competence2, challenge_pix1d1, challenge_pix1d2],
      //   });
      //   const result = await challengeDatasource.getBySkillId(skillId);
      //
      //   // then
      //   expect(lcms.getLatestRelease).to.have.been.called;
      //
      //   expect([result]).to.contain.oneOf(expectedChallenges);
      // });

      it('should return an array of validated or proposed challenges', async function () {
        // when
        sinon.stub(lcms, 'getLatestRelease').resolves({
          challenges: [
            challenge_web1,
            challenge_competence2,
            validated_challenge_pix1d,
            proposed_challenge_pix1d,
            obsolete_challenge_pix1d,
          ],
        });
        const result = await challengeDatasource.getBySkillId(skillId);

        // then
        expect(result).to.deep.equal([validated_challenge_pix1d, proposed_challenge_pix1d]);
      });
    });

    context('when there is only one challenge for the skillId', function () {
      it('should return a challenge from learning content', async function () {
        // when
        sinon.stub(lcms, 'getLatestRelease').resolves({
          challenges: [challenge_web1, challenge_competence2, validated_challenge_pix1d],
        });
        const result = await challengeDatasource.getBySkillId(skillId);

        // then
        expect(lcms.getLatestRelease).to.have.been.called;
        expect(result).to.deep.equal([validated_challenge_pix1d]);
      });
    });

    it('should return an error if there is no challenge for the given skillId', async function () {
      // when
      sinon.stub(lcms, 'getLatestRelease').resolves({
        challenges: [challenge_web1, challenge_competence2, validated_challenge_pix1d, proposed_challenge_pix1d],
      });
      const error = await catchErr(challengeDatasource.getBySkillId)('falseId');

      // then
      expect(error).to.be.instanceOf(LearningContentResourceNotFound);
    });
  });
});
