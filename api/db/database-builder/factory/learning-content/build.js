import { buildArea, buildAreaWithNoDefaultValues } from './build-area.js';
import { buildChallenge, buildChallengeWithNoDefaultValues } from './build-challenge.js';
import { buildCompetence, buildCompetenceWithNoDefaultValues } from './build-competence.js';
import { buildCourse, buildCourseWithNoDefaultValues } from './build-course.js';
import { buildFramework, buildFrameworkWithNoDefaultValues } from './build-framework.js';
import { buildMission, buildMissionWithNoDefaultValues } from './build-mission.js';
import { buildModule, buildModuleWithNoDefaultValues } from './build-module.js';
import { buildSkill, buildSkillWithNoDefaultValues } from './build-skill.js';
import { buildThematic, buildThematicWithNoDefaultValues } from './build-thematic.js';
import { buildTube, buildTubeWithNoDefaultValues } from './build-tube.js';
import { buildTutorial, buildTutorialWithNoDefaultValues } from './build-tutorial.js';

let nock;
/**
 * @param {Object} learningContent
 * @param {{
 *   noDefaultValues: boolean
 * }} options
 */
export function build(learningContent, { noDefaultValues = false } = {}) {
  learningContent.frameworks?.forEach(noDefaultValues ? buildFrameworkWithNoDefaultValues : buildFramework);
  learningContent.areas?.forEach(noDefaultValues ? buildAreaWithNoDefaultValues : buildArea);
  learningContent.competences?.forEach(noDefaultValues ? buildCompetenceWithNoDefaultValues : buildCompetence);
  learningContent.thematics?.forEach(noDefaultValues ? buildThematicWithNoDefaultValues : buildThematic);
  learningContent.tubes?.forEach(noDefaultValues ? buildTubeWithNoDefaultValues : buildTube);
  learningContent.skills?.forEach(noDefaultValues ? buildSkillWithNoDefaultValues : buildSkill);
  learningContent.challenges?.forEach(noDefaultValues ? buildChallengeWithNoDefaultValues : buildChallenge);
  learningContent.courses?.forEach(noDefaultValues ? buildCourseWithNoDefaultValues : buildCourse);
  learningContent.tutorials?.forEach(noDefaultValues ? buildTutorialWithNoDefaultValues : buildTutorial);
  learningContent.missions?.forEach(noDefaultValues ? buildMissionWithNoDefaultValues : buildMission);
  learningContent.modules?.forEach(noDefaultValues ? buildModuleWithNoDefaultValues : buildModule);

  return nock?.('https://lcms-test.pix.fr/api')
    .get('/releases/latest')
    .matchHeader('Authorization', 'Basic dGVzdC1wYXNzd29yZA==') // test-password
    .matchHeader('X-Api-Key', 'test-api-key')
    .reply(200, { content: learningContent });
}

export function injectNock(value) {
  nock = value;
}
