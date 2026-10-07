import { expect } from 'chai';

import { databaseBuilder } from '../../../tooling/databases.js';
import {
  both,
  expectSame,
  expectSameReadings,
  givenTheSameChallengePicks,
  playBoth,
} from '../../../tooling/knowledge-state/twin-checks.js';
import {
  actions,
  buildCampaign,
  buildProfilesCollectionCampaign,
  buildTwins,
  competenceNamed,
  daysPass,
  knowledge,
  learningContentMoves,
  readings,
} from '../../../tooling/knowledge-state/twins.js';
import { getServer } from '../../../tooling/server/shared-server.js';

/**
 * Each scenario chains, on the same twins, what a learner does over months,
 * and compares every reading after every step. A single scenario cannot see
 * an order of steps that leaves the two paths apart: these can.
 *
 * The sciences competence has the deep tube: the planets, levels 1 to 7
 * without the 4, next to the elements, a single level 4.
 */
describe('Acceptance | Knowledge states | twin life scenarios', function () {
  this.timeout(60_000);

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

  const sciences = () => competenceNamed('Sciences').id;
  const histoire = () => competenceNamed('Histoire').id;
  const names = (played) => played.map(({ skill }) => skill);
  const earnedPixOf = (scorecard) => scorecard.body.data.attributes['earned-pix'];

  // The participations a twin made last, read back by the learner and the prescriber.
  const remember = (twins, key, started) => {
    twins.migrated[key] = started.migrated.campaignParticipationId;
    twins.other[key] = started.other.campaignParticipationId;
  };

  it('should keep both paths together over a school year: evaluation, improving, campaign, share, reset, retry, new start', async function () {
    // given: twins who know the third planet and failed the sixth long ago,
    // a campaign on the battles and the planets, and a profiles collection
    const twins = await buildTwins({ validated: ['planètes3'], invalidated: ['planètes6'] });
    const campaign = buildCampaign({ tubes: ['batailles', 'planètes'], multipleSendings: true });
    const collection = buildProfilesCollectionCampaign({ multipleSendings: true });
    await databaseBuilder.commit();
    const profileReadings = [
      read.profile,
      read.certifiability,
      (twin) => read.scorecard(twin, sciences()),
      (twin) => read.scorecard(twin, histoire()),
    ];
    const campaignReadings = [
      (twin) => read.campaignAssessmentResult(twin, campaign.campaignId),
      (twin) => read.campaignParticipations(twin, campaign.campaignId),
      (twin) => read.prescriberParticipationResults(twin, { ...campaign, campaignParticipationId: twin.lastPlayed }),
    ];
    const collectionReadings = [
      (twin) => read.sharedProfile(twin, collection.campaignId),
      (twin) => read.prescriberProfile(twin, { ...collection, campaignParticipationId: twin.lastShared }),
    ];

    // September: the learner evaluates the sciences, knowing the fifth planet and the elements
    const evaluation = await both(twins, (twin) => act.startCompetenceEvaluation(twin, sciences()));
    const evaluated = await playBoth(
      act,
      twins,
      evaluation,
      knowledge({ defaultLevel: 0, tubes: { planètes: 5, éléments: 4 } }),
    );
    expect(names(evaluated)).to.have.members(['planètes5', 'éléments4']);
    await expectSameReadings(twins, ...profileReadings);

    // A week later: the learner improves, now knowing every planet. The old
    // failure is asked again, and the planet above it once it is validated.
    await daysPass(twins, 7);
    const improving = await both(twins, (twin) => act.improveCompetenceEvaluation(twin, sciences()));
    expect(improving.migrated.statusCode).to.equal(improving.other.statusCode);
    const improved = await playBoth(act, twins, improving, knowledge({ defaultLevel: 7 }));
    expect(names(improved)).to.have.members(['planètes6', 'planètes7']);
    await expectSameReadings(twins, ...profileReadings);

    // October: the campaign, where only the battles are left to ask, and the third one fails
    const first = await both(twins, (twin) => act.startCampaignParticipation(twin, campaign));
    remember(twins, 'lastPlayed', first);
    const firstGame = await playBoth(act, twins, first, knowledge({ defaultLevel: 7, tubes: { batailles: 2 } }));
    expect(names(firstGame)).to.have.members(['batailles2', 'batailles3']);
    await both(twins, (twin) => act.computeCampaignResults(twin, twin.lastPlayed));
    await expectSameReadings(twins, ...profileReadings, ...campaignReadings);

    // November: the learner shares their profile with the organisation
    const share = await both(twins, (twin) => act.startCampaignParticipation(twin, collection));
    remember(twins, 'lastShared', share);
    const shared = await both(twins, (twin) => act.shareCampaignParticipation(twin, twin.lastShared));
    expect(shared.migrated.statusCode).to.equal(204);
    expectSame(shared);
    await expectSameReadings(twins, ...collectionReadings);

    // Two weeks later: the sciences are reset. The shared profile and the
    // campaign results are what they were.
    await daysPass(twins, 14);
    const reset = await both(twins, (twin) => act.resetCompetence(twin, sciences()));
    expectSame(reset);
    expect(reset.migrated.statusCode).to.equal(200);
    await expectSameReadings(twins, ...profileReadings, ...campaignReadings, ...collectionReadings);
    expect(earnedPixOf(await read.scorecard(twins.migrated, sciences()))).to.equal(0);

    // December: the learner retries the campaign, knowing the third battle
    // now. The planets, reset, are asked again as well.
    const retry = await both(twins, (twin) =>
      act.startCampaignParticipation(twin, { campaignId: campaign.campaignId, isRetry: true }),
    );
    remember(twins, 'lastPlayed', retry);
    const retryGame = await playBoth(act, twins, retry, knowledge({ defaultLevel: 3 }));
    expect(names(retryGame)).to.include('batailles3');
    expect(names(retryGame)).to.include('planètes3');
    await both(twins, (twin) => act.computeCampaignResults(twin, twin.lastPlayed));
    await expectSameReadings(twins, ...profileReadings, ...campaignReadings);

    // January: the sciences are evaluated again, and the profile shared again
    const again = await both(twins, (twin) => act.startCompetenceEvaluation(twin, sciences()));
    await playBoth(act, twins, again, knowledge({ defaultLevel: 3 }));
    const shareAgain = await both(twins, (twin) =>
      act.startCampaignParticipation(twin, { campaignId: collection.campaignId, isRetry: true }),
    );
    remember(twins, 'lastShared', shareAgain);
    await both(twins, (twin) => act.shareCampaignParticipation(twin, twin.lastShared));
    await expectSameReadings(twins, ...profileReadings, ...campaignReadings, ...collectionReadings);
    const profiles = await read.prescriberProfiles([twins.migrated, twins.other], collection);
    expect(profiles.statusCode).to.equal(200);
    expect(profiles.body.data[0]).to.deep.equal(profiles.body.data[1]);
  });

  it('should keep both paths together between a campaign, an improving and a campaign reset on the deep tube', async function () {
    // given: twins who know the third planet, and a campaign on the planets only
    const twins = await buildTwins({ validated: ['planètes3'] });
    const campaign = buildCampaign({ tubes: ['planètes'], multipleSendings: true });
    await databaseBuilder.commit();
    const profileReadings = [read.profile, read.certifiability, (twin) => read.scorecard(twin, sciences())];
    const campaignReadings = [
      (twin) => read.campaignAssessmentResult(twin, campaign.campaignId),
      (twin) => read.campaignParticipations(twin, campaign.campaignId),
      (twin) => read.prescriberParticipationResults(twin, { ...campaign, campaignParticipationId: twin.lastPlayed }),
    ];

    // the campaign, knowing up to the sixth planet: the seventh fails
    const first = await both(twins, (twin) => act.startCampaignParticipation(twin, campaign));
    remember(twins, 'lastPlayed', first);
    const firstGame = await playBoth(act, twins, first, knowledge({ defaultLevel: 6 }));
    expect(names(firstGame)).to.have.members(['planètes5', 'planètes6', 'planètes7']);
    await both(twins, (twin) => act.computeCampaignResults(twin, twin.lastPlayed));
    await expectSameReadings(twins, ...profileReadings, ...campaignReadings);

    // the learner evaluates the sciences: only the elements are left to ask
    const evaluation = await both(twins, (twin) => act.startCompetenceEvaluation(twin, sciences()));
    const evaluated = await playBoth(act, twins, evaluation, knowledge({ defaultLevel: 6 }));
    expect(names(evaluated)).to.deep.equal(['éléments4']);
    await expectSameReadings(twins, ...profileReadings);

    // a week later, improving: the seventh planet is asked again, and known now
    await daysPass(twins, 7);
    const improving = await both(twins, (twin) => act.improveCompetenceEvaluation(twin, sciences()));
    expect(improving.migrated.statusCode).to.equal(improving.other.statusCode);
    const improved = await playBoth(act, twins, improving, knowledge({ defaultLevel: 7 }));
    expect(names(improved)).to.deep.equal(['planètes7']);
    await expectSameReadings(twins, ...profileReadings, ...campaignReadings);

    // a week later, the campaign is reset and played again by a learner who forgot: the planets start over
    await daysPass(twins, 7);
    const reset = await both(twins, (twin) =>
      act.startCampaignParticipation(twin, { campaignId: campaign.campaignId, isReset: true }),
    );
    remember(twins, 'lastPlayed', reset);
    expect(reset.migrated.statusCode).to.equal(201);
    const resetGame = await playBoth(act, twins, reset, knowledge({ defaultLevel: 2 }));
    expect(names(resetGame)).to.include('planètes3');
    await both(twins, (twin) => act.computeCampaignResults(twin, twin.lastPlayed));
    await expectSameReadings(twins, ...profileReadings, ...campaignReadings);
    const scorecards = await both(twins, (twin) => read.scorecard(twin, sciences()));
    expect(earnedPixOf(scorecards.migrated)).to.equal(12);
  });

  it('should document the known difference when a pix value changes on a tube the learner plays again', async function () {
    // given: twins who know the sixth planet, worth 20 pix with the levels below
    const twins = await buildTwins({ validated: ['planètes6'] });
    await databaseBuilder.commit();
    const profileReadings = [read.profile, (twin) => read.scorecard(twin, sciences())];

    // when: the fifth planet becomes worth more, which moves nothing until the tube is played
    await move.changePixValue('planètes5', 6);
    await expectSameReadings(twins, ...profileReadings);

    // and the learner evaluates the sciences, knowing everything
    const evaluation = await both(twins, (twin) => act.startCompetenceEvaluation(twin, sciences()));
    const evaluated = await playBoth(act, twins, evaluation, knowledge({ defaultLevel: 7 }));
    expect(names(evaluated)).to.have.members(['planètes7', 'éléments4']);

    // then: this is a known difference. A right answer creates again the
    // lower levels of its tube as inferred knowledge elements, worth the
    // current value of the skills: the fifth planet is now worth 6 to the
    // other twin. The migrated twin's score keeps what was earned before and
    // gains the seventh planet and the elements only.
    const scorecards = await both(twins, (twin) => read.scorecard(twin, sciences()));
    expect(earnedPixOf(scorecards.other)).to.equal(30);
    expect(earnedPixOf(scorecards.migrated)).to.equal(28);
  });

  it('should finish a campaign the same after a competence of the campaign was reset in the middle of it', async function () {
    // given: twins who know the third planet, and a campaign on the whole
    // sciences competence and the battles
    const twins = await buildTwins({ validated: ['planètes3'] });
    const campaign = buildCampaign({ tubes: ['planètes', 'éléments', 'batailles'], multipleSendings: true });
    await databaseBuilder.commit();
    const knows = knowledge({ defaultLevel: 3, tubes: { planètes: 6, éléments: 4 } });
    const profileReadings = [read.profile, (twin) => read.scorecard(twin, sciences())];
    const campaignReadings = [
      (twin) => read.campaignAssessmentResult(twin, campaign.campaignId),
      (twin) => read.campaignParticipations(twin, campaign.campaignId),
      (twin) => read.prescriberParticipationResults(twin, { ...campaign, campaignParticipationId: twin.lastPlayed }),
    ];

    // when: the learner starts the campaign and leaves after two answers
    const started = await both(twins, (twin) => act.startCampaignParticipation(twin, campaign));
    remember(twins, 'lastPlayed', started);
    const left = await both(twins, (twin) => act.playSome(twin, started[twin.name].assessmentId, knows, 2));
    expectSame(left);
    expect(left.migrated).to.have.lengthOf(2);
    await expectSameReadings(twins, ...profileReadings);

    // and resets the sciences a week later: the campaign assessment starts over
    await daysPass(twins, 8);
    const reset = await both(twins, (twin) => act.resetCompetence(twin, sciences()));
    expectSame(reset);
    expect(reset.migrated.statusCode).to.equal(200);
    const current = await both(twins, (twin) => act.currentAssessment(twin, twin.lastPlayed));
    expectSame({ migrated: current.migrated.state, other: current.other.state });
    expect(current.migrated.assessmentId).to.not.equal(started.migrated.assessmentId);
    await expectSameReadings(twins, ...profileReadings);
    expect(earnedPixOf(await read.scorecard(twins.migrated, sciences()))).to.equal(0);

    // and comes back to finish the campaign: the planets are asked again
    const finished = await playBoth(act, twins, current, knows);
    expect(names(finished).filter((name) => name.startsWith('planètes'))).to.not.be.empty;
    await both(twins, (twin) => act.computeCampaignResults(twin, twin.lastPlayed));

    // then
    await expectSameReadings(twins, ...profileReadings, ...campaignReadings);
    const results = await read.prescriberAssessmentResults([twins.migrated, twins.other], campaign);
    expect(results.body.data[0]).to.deep.equal(results.body.data[1]);
  });
});
