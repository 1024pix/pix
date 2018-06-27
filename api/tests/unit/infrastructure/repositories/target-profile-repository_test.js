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
          new Skill({ name: '@accesDonnées2' }),
          new Skill({ name: '@accesDonnées1' }),
          new Skill({ name: '@collecteDonnées2' }),
          new Skill({ name: '@collecteDonnées1' }),
          new Skill({ name: '@infosPerso4' }),
          new Skill({ name: '@infosPerso3' }),
          new Skill({ name: '@infosPerso2' }),
          new Skill({ name: '@infosPerso1' }),
          new Skill({ name: '@tracesLocales3' }),
          new Skill({ name: '@tracesLocales2' }),
          new Skill({ name: '@tracesLocales1' }),
          new Skill({ name: '@tracesPratiques6' }),
          new Skill({ name: '@tracesPratiques5' }),
          new Skill({ name: '@tracesPratiques4' }),
          new Skill({ name: '@tracesPratiques3' }),
          new Skill({ name: '@tracesPratiques2' }),
          new Skill({ name: '@tracesPratiques1' }),
          new Skill({ name: '@archive4' }),
          new Skill({ name: '@archive3' }),
          new Skill({ name: '@archive2' }),
          new Skill({ name: '@archive1' }),
          new Skill({ name: '@fichier1' }),
          new Skill({ name: '@propFichier3' }),
          new Skill({ name: '@propFichier2' }),
          new Skill({ name: '@propFichier1' }),
          new Skill({ name: '@sauvegarde6' }),
          new Skill({ name: '@sauvegarde5' }),
          new Skill({ name: '@sauvegarde4' }),
          new Skill({ name: '@sauvegarde3' }),
          new Skill({ name: '@sauvegarde2' }),
          new Skill({ name: '@sauvegarde1' }),
          new Skill({ name: '@unite2' }),
          new Skill({ name: '@unite1' }),
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

