import { createConsolidatedFramework } from '../../../../../../src/certification/configuration/domain/usecases/create-consolidated-framework.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { FRENCH_SPOKEN } from '../../../../../../src/shared/domain/services/locale-service.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Configuration | Unit | UseCase | create-consolidated-framework', function () {
  let challengeRepository, consolidatedFrameworkRepository, tubeRepository, skillRepository;

  beforeEach(function () {
    tubeRepository = {
      findActiveByRecordIds: sinon.stub(),
    };
    skillRepository = {
      findActiveByRecordIds: sinon.stub(),
    };
    challengeRepository = {
      findOperativeBySkills: sinon.stub(),
    };
    consolidatedFrameworkRepository = {
      create: sinon.stub(),
    };
  });

  it('should create a new consolidated framework', async function () {
    // given
    const complementaryCertificationKey = ComplementaryCertificationKeys.PIX_PLUS_PRO_SANTE;

    const tube1 = domainBuilder.buildTube({
      id: 'recTube1',
      skills: [domainBuilder.buildSkill({ id: 'skill1' }), domainBuilder.buildSkill({ id: 'skill2' })],
    });
    const tube2 = domainBuilder.buildTube({ id: 'recTube2', skills: [domainBuilder.buildSkill({ id: 'skill3' })] });
    const tubeIds = [tube1.id, tube2.id];

    const challenges = [
      domainBuilder.buildChallenge({ id: 'challenge1' }),
      domainBuilder.buildChallenge({ id: 'challenge2' }),
      domainBuilder.buildChallenge({ id: 'challenge3' }),
    ];

    tubeRepository.findActiveByRecordIds.resolves([tube1, tube2]);
    skillRepository.findActiveByRecordIds.resolves([...tube1.skills, ...tube2.skills]);
    challengeRepository.findOperativeBySkills.resolves(challenges);
    consolidatedFrameworkRepository.create.resolves();
    sinon.useFakeTimers({ now: new Date('2019-01-01T05:06:07Z'), toFake: ['Date'] });
    const version = '20190101050607';

    // when
    await createConsolidatedFramework({
      complementaryCertificationKey,
      tubeIds,
      tubeRepository,
      skillRepository,
      challengeRepository,
      consolidatedFrameworkRepository,
    });

    // then
    expect(tubeRepository.findActiveByRecordIds).to.have.been.calledOnceWithExactly(tubeIds, FRENCH_SPOKEN);
    expect(skillRepository.findActiveByRecordIds).to.have.been.calledOnceWithExactly([
      ...tube1.skillIds,
      ...tube2.skillIds,
    ]);
    expect(challengeRepository.findOperativeBySkills).to.have.been.calledOnceWithExactly(
      [...tube1.skills, ...tube2.skills],
      FRENCH_SPOKEN,
    );
    expect(consolidatedFrameworkRepository.create).to.have.been.calledOnceWithExactly({
      complementaryCertificationKey,
      challenges,
      version,
    });
  });
});
