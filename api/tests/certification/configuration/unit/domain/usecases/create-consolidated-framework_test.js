import { createConsolidatedFramework } from '../../../../../../src/certification/configuration/domain/usecases/create-consolidated-framework.js';
import { ComplementaryCertificationKeys } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { LOCALE } from '../../../../../../src/shared/domain/constants.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Configuration | Unit | UseCase | create-consolidated-framework', function () {
  let challengeRepository,
    consolidatedFrameworkRepository,
    tubeRepository,
    skillRepository,
    complementaryCertificationRepository,
    uuidService;

  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
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
    complementaryCertificationRepository = Symbol('complementaryCertificationRepository');
    uuidService = Symbol('uuidService');
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

    // when
    await createConsolidatedFramework({
      complementaryCertificationKey,
      tubeIds,
      tubeRepository,
      skillRepository,
      challengeRepository,
      consolidatedFrameworkRepository,
      uuidService,
      complementaryCertificationRepository,
    });

    // then
    expect(tubeRepository.findActiveByRecordIds).to.have.been.calledOnceWithExactly(tubeIds, LOCALE.FRENCH_SPOKEN);
    expect(skillRepository.findActiveByRecordIds).to.have.been.calledOnceWithExactly([
      ...tube1.skillIds,
      ...tube2.skillIds,
    ]);
    expect(challengeRepository.findOperativeBySkills).to.have.been.calledOnceWithExactly(
      [...tube1.skills, ...tube2.skills],
      LOCALE.FRENCH_SPOKEN,
    );
    expect(consolidatedFrameworkRepository.create).to.have.been.calledOnceWithExactly({
      complementaryCertificationKey,
      challenges,
      uuidService,
      complementaryCertificationRepository,
    });
  });
});
