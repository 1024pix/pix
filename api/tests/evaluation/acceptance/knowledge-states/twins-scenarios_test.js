import { expect } from 'chai';

import { databaseBuilder, knex } from '../../../tooling/databases.js';
import {
  both,
  expectSame,
  expectSameReadings,
  givenTheSameChallengePicks,
  playBoth,
  skillsAsked,
} from '../../../tooling/knowledge-state/twin-checks.js';
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
    givenTheSameChallengePicks();
  });

  const histoire = () => competenceNamed('Histoire').id;
  const geographie = () => competenceNamed('Géographie').id;
  const sciences = () => competenceNamed('Sciences').id;

  describe('competence evaluation', function () {
    it('should ask the same challenges and give the same scorecards', async function () {
      // given: twins who already know the first president and nothing of the battles
      const twins = await buildTwins({ validated: ['présidents2'], invalidated: ['batailles2'] });
      await expectSameReadings(twins, read.profile);

      // when
      const started = await both(twins, (twin) => act.startCompetenceEvaluation(twin, histoire()));
      const played = await playBoth(act, twins, started, knowledge({ defaultLevel: 2, tubes: { présidents: 3 } }));

      // then
      expect(played.length).to.be.greaterThan(0);
      await expectSameReadings(twins, read.profile, (twin) => read.scorecard(twin, histoire()));
    });

    it('should ask again every old failure of a tube when improving, even once the tube moved', async function () {
      // given: twins who failed the battles long ago, so that improving asks them again
      const twins = await buildTwins({ validated: ['présidents2'], invalidated: ['batailles2'] });
      const started = await both(twins, (twin) => act.startCompetenceEvaluation(twin, histoire()));
      await playBoth(act, twins, started, knowledge({ defaultLevel: 2, tubes: { présidents: 3 } }));

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
      const played = await playBoth(act, twins, started, knowledge({ defaultLevel: 2 }));

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
      const played = await playBoth(act, twins, started, knowledge({ defaultLevel: 2 }));
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
      const playedAgain = await playBoth(act, twins, retried, knowledge({ defaultLevel: 3 }));
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
      await playBoth(act, twins, started, knowledge({ defaultLevel: 2 }));
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
      await playBoth(act, twins, first, knowledge({ defaultLevel: 3 }));
      await both(twins, (twin) => act.computeCampaignResults(twin, first[twin.name].campaignParticipationId));

      // then: every skill of the campaign is validated, so a retry is refused, and a reset is not
      const retry = await both(twins, (twin) =>
        act.startCampaignParticipation(twin, { campaignId: campaign.campaignId, isRetry: true }),
      );
      expectSame(retry);
      expect(retry.migrated.statusCode).to.equal(403);

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

  describe('campaign with capped tubes', function () {
    it('should ask only the capped levels, give the same results, and forget whole tubes on a reset', async function () {
      // given: twins who know the third battle, and a campaign capped under it
      const twins = await buildTwins({ validated: ['batailles3'] });
      const campaign = buildCampaign({ tubes: { batailles: 2, présidents: 3 }, multipleSendings: true });
      await databaseBuilder.commit();

      // when
      const started = await both(twins, (twin) => act.startCampaignParticipation(twin, campaign));
      const played = await playBoth(act, twins, started, knowledge({ defaultLevel: 3 }));
      await both(twins, (twin) => act.computeCampaignResults(twin, started[twin.name].campaignParticipationId));

      // then: nothing above the cap was asked, and both see the same results
      expect(played.map(({ skill }) => skill)).to.not.include('batailles3');
      expect(played.length).to.be.greaterThan(0);
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

      // when: a new participation resets the campaign tubes
      const reset = await both(twins, (twin) =>
        act.startCampaignParticipation(twin, { campaignId: campaign.campaignId, isReset: true }),
      );

      // then: the whole tubes are forgotten, the third battle above the cap included
      expect(reset.migrated.statusCode).to.equal(201);
      await expectSameReadings(twins, read.profile, (twin) => read.scorecard(twin, histoire()));
      const scorecard = await read.scorecard(twins.migrated, histoire());
      expect(scorecard.body.data.attributes['earned-pix']).to.equal(0);
    });
  });

  describe('campaign with capped tubes, predictions of the POC', function () {
    it('should document the known difference when a failure at the cap of a campaign loses the levels above it', async function () {
      // given: a campaign on the planets capped at level 3, and twins who know level 2
      const twins = await buildTwins();
      const campaign = buildCampaign({ tubes: { planètes: 3 } });
      await databaseBuilder.commit();
      const started = await both(twins, (twin) => act.startCampaignParticipation(twin, campaign));
      const played = await playBoth(act, twins, started, knowledge({ defaultLevel: 2 }));
      expect(skillsAsked({ played })).to.include('planètes3');
      await both(twins, (twin) => act.computeCampaignResults(twin, started[twin.name].campaignParticipationId));
      await expectSameReadings(twins, read.profile, (twin) => read.scorecard(twin, sciences()));

      // when: the learner evaluates the sciences on their own, knowing every planet now
      const evaluation = await both(twins, (twin) => act.startCompetenceEvaluation(twin, sciences()));
      const games = await both(twins, (twin) =>
        act.play(twin, evaluation[twin.name].assessmentId, knowledge({ defaultLevel: 7 })),
      );

      // then: this is a known difference, predicted by the POC. Today's
      // inference stops at the skills of the campaign: the levels above the
      // cap are untouched by the failure and still asked on their own. The
      // ceiling of a knowledge state holds for the whole tube: the migrated
      // twin lost them, and gets them asked again only when improving or
      // after a reset.
      expect(skillsAsked(games.other)).to.deep.equal(['éléments4', 'planètes5', 'planètes7']);
      expect(skillsAsked(games.migrated)).to.deep.equal(['éléments4']);
      const scorecards = await both(twins, (twin) => read.scorecard(twin, sciences()));
      expect(scorecards.other.body.data.attributes['earned-pix']).to.be.greaterThan(
        scorecards.migrated.body.data.attributes['earned-pix'],
      );
    });

    it('should estimate the level from the campaign skills only, whatever was failed above the cap', async function () {
      // given: twins who failed the sixth planet on their own, and a campaign on the planets capped at level 5
      const twins = await buildTwins({ invalidated: ['planètes6'] });
      const campaign = buildCampaign({ tubes: { planètes: 5 } });
      await databaseBuilder.commit();

      // when: the learner knows level 2
      const started = await both(twins, (twin) => act.startCampaignParticipation(twin, campaign));
      const games = await both(twins, (twin) =>
        act.play(twin, started[twin.name].assessmentId, knowledge({ defaultLevel: 2 })),
      );
      await both(twins, (twin) => act.computeCampaignResults(twin, started[twin.name].campaignParticipationId));

      // then
      expect(skillsAsked(games.other)).to.deep.equal(skillsAsked(games.migrated));
      await expectSameReadings(
        twins,
        read.profile,
        (twin) => read.campaignAssessmentResult(twin, campaign.campaignId),
        (twin) => read.scorecard(twin, sciences()),
      );
    });
  });

  describe('campaign with badges and stages', function () {
    it('should earn the same badges and reach the same stage', async function () {
      // given: a campaign on the battles and presidents, with two badges and three stages
      const twins = await buildTwins({ validated: ['présidents2'] });
      const campaign = buildCampaign({ tubes: ['batailles', 'présidents'], badges: [25, 90], stages: [0, 25, 75] });
      await databaseBuilder.commit();

      // when
      const started = await both(twins, (twin) => act.startCampaignParticipation(twin, campaign));
      await playBoth(act, twins, started, knowledge({ defaultLevel: 2 }));
      await both(twins, (twin) => act.computeCampaignResults(twin, started[twin.name].campaignParticipationId));

      // then
      await expectSameReadings(
        twins,
        (twin) => read.campaignAssessmentResult(twin, campaign.campaignId),
        (twin) =>
          read.prescriberParticipationResults(twin, {
            ...campaign,
            campaignParticipationId: started[twin.name].campaignParticipationId,
          }),
      );
      const acquisitions = await both(twins, async (twin) => {
        const campaignParticipationId = started[twin.name].campaignParticipationId;
        return {
          badges: (await knex('badge-acquisitions').where({ campaignParticipationId })).length,
          stages: (await knex('stage-acquisitions').where({ campaignParticipationId })).length,
        };
      });
      expectSame(acquisitions);
      expect(acquisitions.migrated.badges).to.equal(1);
      expect(acquisitions.migrated.stages).to.be.greaterThan(0);
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
      const played = await playBoth(act, twins, started, knowledge({ defaultLevel: 2 }));
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
      await playBoth(act, twins, evaluation, knowledge({ defaultLevel: 2 }));

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
        await playBoth(act, twins, started, knowledge({ defaultLevel: 2 }));
      }

      // then
      const certifiableAfter = await both(twins, read.certifiability);
      expectSame(certifiableAfter);
      expect(certifiableAfter.migrated.body.data.attributes['is-certifiable']).to.equal(true);
      await expectSameReadings(twins, read.profile);
    });
  });
});
