const { expect } = require('../../../test-helper');
const targetProfileRepository = require('../../../../lib/infrastructure/repositories/target-profile-repository');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const Skill = require('../../../../lib/domain/models/Skill');

describe('Unit | Repository | target-profile-repository', function() {

  describe('#get', function() {

    it('should return the easy profile whatever the id parameter', function() {
      // given
      const expectedProfile = new TargetProfile({
        skills: [
          new Skill({ name: '@connectique2' }),
          new Skill({ name: '@connectique3' }),
          new Skill({ name: '@appliOS1' }),
          new Skill({ name: '@recherche1' }),
          new Skill({ name: '@recherche2' }),
          new Skill({ name: '@environnementTravail1' }),
          new Skill({ name: '@environnementTravail2' }),
          new Skill({ name: '@outilsTexte1' }),
          new Skill({ name: '@outilsTexte2' }),
          new Skill({ name: '@copierColler1' }),
          new Skill({ name: '@copierColler2' }),
          new Skill({ name: '@miseEnFormeTttTxt1' }),
          new Skill({ name: '@miseEnFormeTttTxt2' }),
          new Skill({ name: '@form_intero2' }),
          new Skill({ name: '@champsCourriel1' }),
          new Skill({ name: '@Moteur1' }),
          new Skill({ name: '@rechinfo1' }),
          new Skill({ name: '@rechinfo3' }),
          new Skill({ name: '@outilsRS1' }),
          new Skill({ name: '@outilsRS2' }),
          new Skill({ name: '@outilsMessagerie2' }),
          new Skill({ name: '@outilsMessagerie3' }),
          new Skill({ name: '@accesDonnées1' }),
          new Skill({ name: '@accesDonnées2' }),
          new Skill({ name: '@choixmotdepasse1' }),
        ],
      });

      // when
      const promise = targetProfileRepository.get('unusedparameter');

      // then
      return promise.then((result) => {
        expect(result).to.deep.equal(expectedProfile);
      });
    });
  });
});

