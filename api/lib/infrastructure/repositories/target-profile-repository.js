const TargetProfile = require('../../domain/models/TargetProfile');
const Skill = require('../../domain/models/Skill');

module.exports = {

  get(_targetProfileId) {
    return Promise.resolve(
      new TargetProfile({
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
      }),
    );
  },
};

