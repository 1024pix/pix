const _ = require('lodash');
const Skill = require('./Skill');

class TargetProfile {
  constructor({ skills = [] } = {}) {
    const completeListOfSkills = [];

    skills.forEach((skill) => {
      for(let skillLevel = skill.difficulty; skillLevel > 0; skillLevel--) {
        completeListOfSkills.push(new Skill({ name: `${skill.tubeNameWithAt}${skillLevel}` }));
      }
    });

    const listOfUniqueSkills =_.uniqWith(completeListOfSkills, _.isEqual);

    this.skills = listOfUniqueSkills;
  }

  static get TEST_PROFIL() {

    const targetSkills = [
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
    ];

    return new TargetProfile({ skills: targetSkills });
  }
}

module.exports = TargetProfile;
