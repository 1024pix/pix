import { base, Faker } from '@faker-js/faker';
import { expect } from 'chai';

import { databaseBuilder } from '../../../tooling/databases.js';
import {
  both,
  expectSame,
  expectSameReadings,
  givenTheSameChallengePicks,
} from '../../../tooling/knowledge-state/twin-checks.js';
import {
  actions,
  buildCampaign,
  buildProfilesCollectionCampaign,
  buildTwins,
  daysPass,
  knowledge,
  readings,
  release,
} from '../../../tooling/knowledge-state/twins.js';
import { getServer } from '../../../tooling/server/shared-server.js';

// Walks per run, each named by its seed: a failing walk is replayed by its
// seed alone. Raise the count locally to search further.
const WALKS = 3;
const STEPS_PER_WALK = 8;
const MAX_LEVEL = 7;

/**
 * Each walk drives the twins through random steps, drawn from a seeded
 * generator, and compares every reading after every step: what nobody
 * thought of writing as a scenario. The steps are the ones a learner can
 * take, with the days passing that the delays before improving or resetting
 * need. The moves of the learning content are left out: a new version of a
 * skill, or a pix value changing on a tube played again, are known
 * differences.
 */
describe('Acceptance | Knowledge states | twin random walks', function () {
  this.timeout(120_000);

  let server;
  let act;
  let read;

  beforeEach(async function () {
    server = await getServer();
    act = actions(server);
    read = readings(server);
    givenTheSameChallengePicks();
  });

  const skillsOf = (tube) => release.skills.filter(({ tubeId }) => tubeId === tube.id);
  const tubes = release.tubes.filter((tube) => skillsOf(tube).length > 0);
  const tubeNames = tubes.map(({ name }) => name);
  const competenceOf = (competenceId) => release.competences.find(({ id }) => id === competenceId);

  // What the twins start with: on each tube, nothing, a level known or a level failed long ago.
  const drawInitialKnowledge = (faker) =>
    tubes.reduce(
      (initial, tube) => {
        const fate = faker.helpers.weightedArrayElement([
          { weight: 4, value: 'nothing' },
          { weight: 4, value: 'validated' },
          { weight: 2, value: 'invalidated' },
        ]);
        return fate === 'nothing'
          ? initial
          : { ...initial, [fate]: [...initial[fate], faker.helpers.arrayElement(skillsOf(tube)).name] };
      },
      { validated: [], invalidated: [] },
    );

  // What the learner knows at a step: a level on each tube.
  const drawKnowledge = (faker) =>
    knowledge({
      defaultLevel: 0,
      tubes: Object.fromEntries(tubeNames.map((name) => [name, faker.number.int({ min: 0, max: MAX_LEVEL })])),
    });

  const remember = (twins, key, started) => {
    twins.migrated[key] = started.migrated.campaignParticipationId;
    twins.other[key] = started.other.campaignParticipationId;
  };

  /**
   * The steps of a walk. Each one acts on both twins, expects the same
   * outcome, and tells what it did; the readings it makes due are compared
   * after every later step.
   */
  const buildSteps = ({ faker, twins, campaign, collection }) => {
    const started = new Set();
    const due = new Set();
    // The knowledge is drawn once per step: both twins know the same.
    const playBothOn = async (assessments) => {
      const knows = drawKnowledge(faker);
      const games = await both(twins, (twin) => act.play(twin, assessments[twin.name].assessmentId, knows));
      expectSame(games);
      return games.migrated.played.length;
    };

    const evaluation = async () => {
      const competence = faker.helpers.arrayElement(release.competences);
      const assessments = await both(twins, (twin) => act.startCompetenceEvaluation(twin, competence.id));
      expect(assessments.migrated.statusCode).to.equal(assessments.other.statusCode);
      const answered = await playBothOn(assessments);
      started.add(competence.id);
      due.add(`scorecard:${competence.id}`);
      return `evaluation of ${competence.name_i18n.fr} (${answered} answers)`;
    };

    const improving = async () => {
      if (started.size === 0) return evaluation();
      const competenceId = faker.helpers.arrayElement([...started]);
      await daysPass(twins, 5);
      const assessments = await both(twins, (twin) => act.improveCompetenceEvaluation(twin, competenceId));
      expect(assessments.migrated.statusCode).to.equal(assessments.other.statusCode);
      expect(Boolean(assessments.migrated.assessmentId)).to.equal(Boolean(assessments.other.assessmentId));
      const answered = assessments.migrated.assessmentId ? await playBothOn(assessments) : 'no';
      return `improving ${competenceOf(competenceId).name_i18n.fr} (${answered} answers)`;
    };

    const reset = async () => {
      const competence = faker.helpers.arrayElement(release.competences);
      await daysPass(twins, 8);
      const results = await both(twins, (twin) => act.resetCompetence(twin, competence.id));
      expectSame(results);
      due.add(`scorecard:${competence.id}`);
      return `reset of ${competence.name_i18n.fr} (${results.migrated.statusCode})`;
    };

    const participation = async () => {
      const kind = twins.migrated.lastPlayed ? faker.helpers.arrayElement(['retry', 'reset']) : 'first';
      const assessments = await both(twins, (twin) =>
        act.startCampaignParticipation(twin, {
          campaignId: campaign.campaignId,
          isRetry: kind === 'retry',
          isReset: kind === 'reset',
        }),
      );
      // A retry is refused once every skill of the campaign is validated: the refusal must be the same.
      expect(assessments.migrated.statusCode).to.equal(assessments.other.statusCode);
      expect(assessments.migrated.errors).to.deep.equal(assessments.other.errors);
      if (!assessments.migrated.assessmentId) {
        return `${kind} participation refused (${assessments.migrated.statusCode})`;
      }
      remember(twins, 'lastPlayed', assessments);
      const answered = await playBothOn(assessments);
      await both(twins, (twin) => act.computeCampaignResults(twin, twin.lastPlayed));
      due.add('campaign');
      return `${kind} participation (${answered} answers)`;
    };

    const share = async () => {
      const participations = await both(twins, (twin) =>
        act.startCampaignParticipation(twin, { campaignId: collection.campaignId, isRetry: Boolean(twin.lastShared) }),
      );
      expect(participations.migrated.statusCode, JSON.stringify(participations.migrated.errors)).to.equal(201);
      remember(twins, 'lastShared', participations);
      const shared = await both(twins, (twin) => act.shareCampaignParticipation(twin, twin.lastShared));
      expectSame(shared);
      expect(shared.migrated.statusCode).to.equal(204);
      due.add('collection');
      return 'share of the profile';
    };

    const days = async () => {
      const count = faker.number.int({ min: 1, max: 10 });
      await daysPass(twins, count);
      return `${count} days pass`;
    };

    const dueReadings = () =>
      [...due].flatMap((key) => {
        if (key === 'campaign') {
          return [
            (twin) => read.campaignAssessmentResult(twin, campaign.campaignId),
            (twin) => read.campaignParticipations(twin, campaign.campaignId),
            (twin) =>
              read.prescriberParticipationResults(twin, { ...campaign, campaignParticipationId: twin.lastPlayed }),
          ];
        }
        if (key === 'collection') {
          return [
            (twin) => read.sharedProfile(twin, collection.campaignId),
            (twin) => read.prescriberProfile(twin, { ...collection, campaignParticipationId: twin.lastShared }),
          ];
        }
        const competenceId = key.replace('scorecard:', '');
        return [(twin) => read.scorecard(twin, competenceId)];
      });

    const expectSameReadingsNow = async () => {
      await expectSameReadings(twins, read.profile, read.certifiability, ...dueReadings());
      if (due.has('campaign')) {
        const results = await read.prescriberAssessmentResults([twins.migrated, twins.other], campaign);
        expect(results.body.data[0]).to.deep.equal(results.body.data[1]);
      }
      if (due.has('collection')) {
        const profiles = await read.prescriberProfiles([twins.migrated, twins.other], collection);
        expect(profiles.body.data[0]).to.deep.equal(profiles.body.data[1]);
      }
    };

    const drawStep = () =>
      faker.helpers.weightedArrayElement([
        { weight: 30, value: evaluation },
        { weight: 20, value: participation },
        { weight: 10, value: share },
        { weight: 10, value: improving },
        { weight: 5, value: reset },
        { weight: 15, value: days },
      ]);

    return { drawStep, expectSameReadingsNow };
  };

  for (const seed of Array.from({ length: WALKS }, (_, index) => index + 1)) {
    it(`should give the twins the same readings along the walk of seed ${seed}`, async function () {
      const faker = new Faker({ locale: [base] });
      faker.seed(seed);

      // given: twins with random knowledge, a campaign on random tubes and a profiles collection
      const twins = await buildTwins(drawInitialKnowledge(faker));
      const campaign = buildCampaign({
        tubes: faker.helpers.arrayElements(tubeNames, { min: 2, max: 4 }),
        multipleSendings: true,
      });
      const collection = buildProfilesCollectionCampaign({ multipleSendings: true });
      await databaseBuilder.commit();
      const { drawStep, expectSameReadingsNow } = buildSteps({ faker, twins, campaign, collection });

      // when, then: after each step, every reading is the same
      const log = [];
      try {
        await expectSameReadingsNow();
        for (let index = 0; index < STEPS_PER_WALK; index++) {
          log.push(await drawStep()());
          await expectSameReadingsNow();
        }
      } catch (error) {
        error.message = `walk of seed ${seed}, after: ${log.join(' > ')}\n${error.message}`;
        throw error;
      }
      expect(log).to.have.lengthOf(STEPS_PER_WALK);
    });
  }
});
