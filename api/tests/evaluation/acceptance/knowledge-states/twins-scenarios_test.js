import { expect } from 'chai';
import sinon from 'sinon';

import { pickChallengeService } from '../../../../src/evaluation/domain/services/pick-challenge-service.js';
import { databaseBuilder } from '../../../tooling/databases.js';
import {
  actions,
  buildCampaign,
  buildExamCampaign,
  buildProfilesCollectionCampaign,
  buildTwins,
  competenceNamed,
  knowledge,
  learningContentMoves,
  readings,
} from '../../../tooling/knowledge-state/twins.js';
import { getServer } from '../../../tooling/server/shared-server.js';

/**
 * Each scenario drives a migrated user and a non-migrated twin through the
 * same API calls, as a learner does them, and expects the same answers from
 * the API: the same challenges asked, the same results shown.
 */
describe('Acceptance | Knowledge states | twin scenarios', function () {
  let server;
  let act;
  let read;
  let move;

  beforeEach(async function () {
    server = await getServer();
    act = actions(server);
    read = readings(server);
    move = learningContentMoves();

    // The challenge is picked from a seed that is the assessment id, which
    // differs between twins by construction: both get the same seed here.
    const pickChallenge = pickChallengeService.pickChallenge;
    sinon
      .stub(pickChallengeService, 'pickChallenge')
      .callsFake((params) => pickChallenge({ ...params, randomSeed: 1 }));
  });

  // Runs the same step on both twins, in the same order, and gives both results.
  const both = async (twins, step) => ({ migrated: await step(twins.migrated), other: await step(twins.other) });

  const expectSame = ({ migrated, other }) => expect(migrated).to.deep.equal(other);

  const expectSameReadings = async (twins, ...reads) => {
    for (const readOne of reads) {
      const results = await both(twins, readOne);
      expect(results.migrated.statusCode).to.equal(200);
      expectSame(results);
    }
  };

  // Plays a whole assessment on both twins and expects the same questions and answers.
  const playBoth = async (twins, assessments, knows) => {
    const games = await both(twins, (twin) => act.play(twin, assessments[twin.name].assessmentId, knows));
    expectSame(games);
    expect(games.migrated.completed).to.equal(204);
    return games.migrated.played;
  };

  const skillsAsked = (game) => game.played.map(({ skill }) => skill);

  const histoire = () => competenceNamed('Histoire').id;
  const geographie = () => competenceNamed('Géographie').id;

  describe('competence evaluation', function () {
    it('should ask the same challenges and give the same scorecards', async function () {
      // given: twins who already know the first president and nothing of the battles
      const twins = await buildTwins({ validated: ['présidents2'], invalidated: ['batailles2'] });
      await expectSameReadings(twins, read.profile);

      // when
      const started = await both(twins, (twin) => act.startCompetenceEvaluation(twin, histoire()));
      const played = await playBoth(twins, started, knowledge({ defaultLevel: 2, tubes: { présidents: 3 } }));

      // then
      expect(played.length).to.be.greaterThan(0);
      await expectSameReadings(twins, read.profile, (twin) => read.scorecard(twin, histoire()));
    });

    it('should ask again every old failure of a tube when improving, even once the tube moved', async function () {
      // given: twins who failed the battles long ago, so that improving asks them again
      const twins = await buildTwins({ validated: ['présidents2'], invalidated: ['batailles2'] });
      const started = await both(twins, (twin) => act.startCompetenceEvaluation(twin, histoire()));
      await playBoth(twins, started, knowledge({ defaultLevel: 2, tubes: { présidents: 3 } }));

      // when: the learner improves and now knows the battles
      const improved = await both(twins, (twin) => act.improveCompetenceEvaluation(twin, histoire()));
      const games = await both(twins, (twin) =>
        act.play(twin, improved[twin.name].assessmentId, knowledge({ defaultLevel: 3 })),
      );

      // then: improving asks again the failures older than the delay. The
      // migrated twin's knowledge state keeps the date of the latest failure
      // of the tube apart from its last move, so once the first battle is
      // answered the second one still looks old, and is asked too.
      expect(skillsAsked(games.other)).to.deep.equal(['batailles2', 'batailles3']);
      expect(skillsAsked(games.migrated)).to.deep.equal(['batailles2', 'batailles3']);
      expectSame(await both(twins, (twin) => read.scorecard(twin, histoire())));
    });
  });

  describe('competence reset', function () {
    it('should give the same scorecards after a reset, and after playing the competence again', async function () {
      // given
      const twins = await buildTwins({ validated: ['mers3', 'capitales2'] });

      // when
      const reset = await both(twins, (twin) => act.resetCompetence(twin, geographie()));

      // then
      expectSame(reset);
      expect(reset.migrated.statusCode).to.equal(200);
      await expectSameReadings(twins, read.profile, (twin) => read.scorecard(twin, geographie()));

      // when: the competence is played again from scratch
      const started = await both(twins, (twin) => act.startCompetenceEvaluation(twin, geographie()));
      const played = await playBoth(twins, started, knowledge({ defaultLevel: 2 }));

      // then
      expect(played.length).to.be.greaterThan(0);
      await expectSameReadings(twins, read.profile, (twin) => read.scorecard(twin, geographie()));
    });
  });

  describe('campaign', function () {
    it('should give the same results to the learner and the prescriber, including after a retry', async function () {
      // given
      const twins = await buildTwins({ validated: ['présidents2'] });
      const campaign = buildCampaign({ tubes: ['batailles', 'présidents', 'mers'], multipleSendings: true });
      await databaseBuilder.commit();
      const campaignReadings = [
        (twin) => read.campaignAssessmentResult(twin, campaign.campaignId),
        (twin) => read.campaignParticipations(twin, campaign.campaignId),
        (twin) => read.prescriberParticipationResults(twin, { ...campaign, campaignParticipationId: twin.last }),
      ];

      // when
      const started = await both(twins, (twin) => act.startCampaignParticipation(twin, campaign));
      twins.migrated.last = started.migrated.campaignParticipationId;
      twins.other.last = started.other.campaignParticipationId;
      const played = await playBoth(twins, started, knowledge({ defaultLevel: 2 }));
      await both(twins, (twin) => act.computeCampaignResults(twin, started[twin.name].campaignParticipationId));

      // then
      expect(started.migrated.statusCode).to.equal(201);
      expect(played.length).to.be.greaterThan(0);
      await expectSameReadings(twins, read.profile, ...campaignReadings);

      // when: the learner retries, knowing more
      const retried = await both(twins, (twin) =>
        act.startCampaignParticipation(twin, { campaignId: campaign.campaignId, isRetry: true }),
      );
      twins.migrated.last = retried.migrated.campaignParticipationId;
      twins.other.last = retried.other.campaignParticipationId;
      const playedAgain = await playBoth(twins, retried, knowledge({ defaultLevel: 3 }));
      await both(twins, (twin) => act.computeCampaignResults(twin, retried[twin.name].campaignParticipationId));

      // then
      expect(retried.migrated.statusCode).to.equal(201);
      expect(playedAgain.length).to.be.greaterThan(0);
      await expectSameReadings(twins, read.profile, ...campaignReadings);
    });

    it('should give the prescriber the same campaign results for both participants', async function () {
      // given: both twins take part in the same campaign, so the prescriber sees them side by side
      const twins = await buildTwins();
      const campaign = buildCampaign({ tubes: ['batailles', 'présidents'] });
      await databaseBuilder.commit();

      // when
      const started = await both(twins, (twin) => act.startCampaignParticipation(twin, campaign));
      await playBoth(twins, started, knowledge({ defaultLevel: 2 }));
      await both(twins, (twin) => act.computeCampaignResults(twin, started[twin.name].campaignParticipationId));

      // then: one row per participant, identical once their ids are hidden
      const results = await read.prescriberAssessmentResults([twins.migrated, twins.other], campaign);
      expect(results.statusCode).to.equal(200);
      expect(results.body.data).to.have.lengthOf(2);
      expect(results.body.data[0]).to.deep.equal(results.body.data[1]);

      const collective = await read.prescriberCollectiveResults([twins.migrated, twins.other], campaign);
      expect(collective.statusCode).to.equal(200);
    });

    it('should forget the campaign tubes, and only them, when a participation resets them', async function () {
      // given: twins who know the battles and the seas, and a campaign on the battles only
      const twins = await buildTwins({ validated: ['batailles3', 'mers3'] });
      const campaign = buildCampaign({ tubes: ['batailles'], multipleSendings: true });
      await databaseBuilder.commit();
      const first = await both(twins, (twin) => act.startCampaignParticipation(twin, campaign));
      await playBoth(twins, first, knowledge({ defaultLevel: 3 }));
      await both(twins, (twin) => act.computeCampaignResults(twin, first[twin.name].campaignParticipationId));

      // when: a new participation resets the knowledge on the campaign tubes
      const reset = await both(twins, (twin) =>
        act.startCampaignParticipation(twin, { campaignId: campaign.campaignId, isReset: true }),
      );

      // then: the battles are forgotten, the seas still count
      expect(reset.migrated.statusCode).to.equal(201);
      await expectSameReadings(twins, read.profile, (twin) => read.scorecard(twin, histoire()));
      const geographieScorecard = await read.scorecard(twins.migrated, geographie());
      expect(geographieScorecard.body.data.attributes['earned-pix']).to.be.greaterThan(0);
      const histoireScorecard = await read.scorecard(twins.migrated, histoire());
      expect(histoireScorecard.body.data.attributes['earned-pix']).to.equal(0);
    });
  });

  describe('exam campaign', function () {
    it('should ask the same challenges and give the same results, without touching the profile', async function () {
      // given: twins who know the first battle, which an exam ignores
      const twins = await buildTwins({ validated: ['batailles2'] });
      const campaign = buildExamCampaign({ tubes: ['batailles', 'présidents'] });
      await databaseBuilder.commit();
      const profileBefore = await both(twins, read.profile);
      expectSame(profileBefore);

      // when
      const started = await both(twins, (twin) => act.startCampaignParticipation(twin, campaign));
      const played = await playBoth(twins, started, knowledge({ defaultLevel: 2 }));
      await both(twins, (twin) => act.computeCampaignResults(twin, started[twin.name].campaignParticipationId));

      // then: the exam asked the known battle again, and the profile did not move
      expect(started.migrated.statusCode).to.equal(201);
      expect(played.map(({ skill }) => skill)).to.include('batailles2');
      await expectSameReadings(
        twins,
        read.profile,
        (twin) => read.campaignAssessmentResult(twin, campaign.campaignId),
        (twin) =>
          read.prescriberParticipationResults(twin, {
            ...campaign,
            campaignParticipationId: started[twin.name].campaignParticipationId,
          }),
      );
      const profileAfter = await both(twins, read.profile);
      expect(profileAfter.migrated.body).to.deep.equal(profileBefore.migrated.body);
    });
  });

  describe('profiles collection campaign', function () {
    it('should share the same profile, and still read it the same once a tube moves after the share', async function () {
      // given
      const twins = await buildTwins({ validated: ['présidents2', 'mers3'] });
      const campaign = buildProfilesCollectionCampaign();
      await databaseBuilder.commit();
      const prescriberReadings = [
        (twin) => read.prescriberProfile(twin, { ...campaign, campaignParticipationId: twin.last }),
      ];

      // when
      const started = await both(twins, (twin) => act.startCampaignParticipation(twin, campaign));
      twins.migrated.last = started.migrated.campaignParticipationId;
      twins.other.last = started.other.campaignParticipationId;
      const shared = await both(twins, (twin) => act.shareCampaignParticipation(twin, twin.last));

      // then
      expect(started.migrated.statusCode).to.equal(201);
      expectSame(shared);
      expect(shared.migrated.statusCode).to.equal(204);
      await expectSameReadings(twins, (twin) => read.sharedProfile(twin, campaign.campaignId), ...prescriberReadings);
      const profiles = await read.prescriberProfiles([twins.migrated, twins.other], campaign);
      expect(profiles.statusCode).to.equal(200);
      expect(profiles.body.data).to.have.lengthOf(2);
      expect(profiles.body.data[0]).to.deep.equal(profiles.body.data[1]);

      // when: the learner plays the history competence after sharing
      const evaluation = await both(twins, (twin) => act.startCompetenceEvaluation(twin, histoire()));
      await playBoth(twins, evaluation, knowledge({ defaultLevel: 2 }));

      // then: the prescriber reads the snapshot taken at the share, unchanged
      await expectSameReadings(twins, ...prescriberReadings);

      // and so does the learner: their shared profile is read from the same
      // snapshot. A knowledge state has one date per tube, so a live read at
      // the share date would lose the presidents tube, moved after the share.
      const sharedProfiles = await both(twins, (twin) => read.sharedProfile(twin, campaign.campaignId));
      expectSame(sharedProfiles);
      const histoirePixOf = (profile) =>
        profile.body.included.find(({ type, id }) => type === 'scorecards' && id.endsWith(histoire())).attributes[
          'earned-pix'
        ];
      expect(histoirePixOf(sharedProfiles.migrated)).to.equal(4);
    });
  });

  describe('learning content change', function () {
    it('should keep the same profile when pix values change and a skill gets a new version, and document the difference when playing it', async function () {
      // given: twins who know the first president and failed the first battle long ago
      const twins = await buildTwins({ validated: ['présidents2'], invalidated: ['batailles2'] });
      const before = await both(twins, read.profile);
      expectSame(before);

      // when: a validated skill is worth more
      await move.changePixValue('présidents2', 6);

      // then
      const afterPixValueChange = await both(twins, read.profile);
      expectSame(afterPixValueChange);
      expect(afterPixValueChange.migrated.body).to.deep.equal(before.migrated.body);

      // when: the failed skill is archived and replaced by a new version
      await move.replaceByNewVersion('batailles2');

      // then
      const afterNewVersion = await both(twins, read.profile);
      expectSame(afterNewVersion);
      expect(afterNewVersion.migrated.body).to.deep.equal(before.migrated.body);

      // when: the learner plays the competence on the moved content
      const started = await both(twins, (twin) => act.startCompetenceEvaluation(twin, histoire()));
      const games = await both(twins, (twin) =>
        act.play(twin, started[twin.name].assessmentId, knowledge({ defaultLevel: 3 })),
      );

      // then: this is a known difference. The new version is a new skill with
      // no knowledge element, so today's code asks it again. A knowledge state
      // describes the level, whatever the version, so the migrated twin keeps
      // the old failure and is not asked.
      expect(skillsAsked(games.other)).to.deep.equal(['batailles2', 'présidents3']);
      expect(skillsAsked(games.migrated)).to.deep.equal(['présidents3']);
      const scorecards = await both(twins, (twin) => read.scorecard(twin, histoire()));
      expect(scorecards.other.body.data.attributes['earned-pix']).to.be.greaterThan(
        scorecards.migrated.body.data.attributes['earned-pix'],
      );
    });
  });

  describe('certifiability', function () {
    it('should become certifiable at the same time', async function () {
      // given
      const twins = await buildTwins();
      const certifiableBefore = await both(twins, read.certifiability);
      expectSame(certifiableBefore);
      expect(certifiableBefore.migrated.body.data.attributes['is-certifiable']).to.equal(false);

      // when: every competence is played by a learner who knows level 2
      for (const name of ['Mathématiques', 'Géographie', 'Histoire', 'Français', 'Arts', 'Philosophie']) {
        const started = await both(twins, (twin) => act.startCompetenceEvaluation(twin, competenceNamed(name).id));
        await playBoth(twins, started, knowledge({ defaultLevel: 2 }));
      }

      // then
      const certifiableAfter = await both(twins, read.certifiability);
      expectSame(certifiableAfter);
      expect(certifiableAfter.migrated.body.data.attributes['is-certifiable']).to.equal(true);
      await expectSameReadings(twins, read.profile);
    });
  });
});
