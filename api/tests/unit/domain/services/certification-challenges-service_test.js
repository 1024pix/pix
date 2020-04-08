const { sinon, expect } = require('../../../test-helper');
const certificationChallengesService = require('../../../../lib/domain/services/certification-challenges-service');
const certificationChallengeRepository = require('../../../../lib/infrastructure/repositories/certification-challenge-repository');

describe('Unit | Service | Certification Challenge Service', function() {

  describe('#saveChallenges', () => {

    const challenge1 = {
      id: 'challenge1',
      competence: 'Savoir tester',
      testedSkill: '@skill1'
    };
    const challenge2 = {
      id: 'challenge2',
      competence: 'Savoir debugguer',
      testedSkill: '@skill2'
    };

    const certificationProfileWithOneCompetence = [
      {
        challenges: [challenge1, challenge2]
      }
    ];

    const certificationProfileWithTwoCompetence = [
      {
        challenges: [challenge1]
      }, {
        challenges: [challenge2]
      }
    ];

    const certificationCourse = {
      id :'certification-course-id'
    };

    beforeEach(() => {
      sinon.stub(certificationChallengeRepository, 'save').resolves('challenge');
    });

    context('when profile return one competence with two challenges', () => {
      it('should call certification Challenge Repository save twice', () => {
        //When
        const promise = certificationChallengesService.saveChallenges(certificationProfileWithOneCompetence, certificationCourse);

        //Then
        return promise.then(() => {
          sinon.assert.calledTwice(certificationChallengeRepository.save);
          sinon.assert.calledWith(certificationChallengeRepository.save,challenge1 ,certificationCourse);
          sinon.assert.calledWith(certificationChallengeRepository.save,challenge2 ,certificationCourse);
        });
      });
    });

    context('when profile return two competences with one challenge', () => {
      it('should call certification Challenge Repository save twice', () => {
        //When
        const promise = certificationChallengesService.saveChallenges(certificationProfileWithTwoCompetence, certificationCourse);

        //Then
        return promise.then(() => {
          sinon.assert.calledTwice(certificationChallengeRepository.save);
          sinon.assert.calledWith(certificationChallengeRepository.save,challenge1 ,certificationCourse);
          sinon.assert.calledWith(certificationChallengeRepository.save,challenge2 ,certificationCourse);
        });
      });
    });

    it('should return the certification course with its challenges', function() {
      // when
      const promise = certificationChallengesService.saveChallenges(certificationProfileWithTwoCompetence, certificationCourse);

      // then
      return promise.then((certificationCourse) => {
        expect(certificationCourse).to.deep.equal({
          id :'certification-course-id',
          certificationChallenges : ['challenge', 'challenge'],
        });
      });
    });

  });
});
