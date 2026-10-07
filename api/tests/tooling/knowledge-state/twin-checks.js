/**
 * What the twin scenarios check: the same step run on both twins, in the
 * same order, must give both the same result.
 */
import { expect } from 'chai';
import sinon from 'sinon';

import { pickChallengeService } from '../../../src/evaluation/domain/services/pick-challenge-service.js';

/**
 * The challenge is picked from a seed that is the assessment id, which
 * differs between twins by construction: both get the same seed.
 */
export const givenTheSameChallengePicks = () => {
  const pickChallenge = pickChallengeService.pickChallenge;
  sinon.stub(pickChallengeService, 'pickChallenge').callsFake((params) => pickChallenge({ ...params, randomSeed: 1 }));
};

/** Runs the same step on both twins, the migrated one first, and gives both results. */
export const both = async (twins, step) => ({ migrated: await step(twins.migrated), other: await step(twins.other) });

export const expectSame = ({ migrated, other }) => expect(migrated).to.deep.equal(other);

export const expectSameReadings = async (twins, ...reads) => {
  for (const readOne of reads) {
    const results = await both(twins, readOne);
    expect(results.migrated.statusCode).to.equal(200);
    expectSame(results);
  }
};

/** Plays a whole assessment on both twins and expects the same questions and answers. */
export const playBoth = async (act, twins, assessments, knows) => {
  const games = await both(twins, (twin) => act.play(twin, assessments[twin.name].assessmentId, knows));
  expectSame(games);
  expect(games.migrated.completed).to.equal(204);
  return games.migrated.played;
};

export const skillsAsked = (game) => game.played.map(({ skill }) => skill);
