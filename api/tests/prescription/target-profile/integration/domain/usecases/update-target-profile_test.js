import { expect } from 'chai';

import { usecases } from '../../../../../../src/prescription/target-profile/domain/usecases/index.js';
import * as targetProfileAdministrationRepository from '../../../../../../src/prescription/target-profile/infrastructure/repositories/target-profile-administration-repository.js';
import { DomainError } from '../../../../../../src/shared/domain/errors.js';
import { SCOPES } from '../../../../../../src/shared/domain/models/BadgeDetails.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | UseCase | update-target-profile', function () {
  beforeEach(function () {
    const frameworkId = databaseBuilder.factory.learningContent.buildFramework().id;
    const areaId = databaseBuilder.factory.learningContent.buildArea({
      frameworkId,
    }).id;
    const competenceId = databaseBuilder.factory.learningContent.buildCompetence({
      areaId,
    }).id;
    const thematicId = databaseBuilder.factory.learningContent.buildThematic({
      competenceId,
      tubes: ['tubeId1', 'tubeId2'],
    }).id;
    databaseBuilder.factory.learningContent.buildTube({
      id: 'tubeId1',
      competenceId,
      thematicId,
    }).id;
    databaseBuilder.factory.learningContent.buildTube({
      id: 'tubeId2',
      competenceId,
      thematicId,
    }).id;

    databaseBuilder.factory.learningContent.buildSkill({
      id: 'skill_tubeId1',
      tubeId: 'tubeId1',
      status: 'actif',
      level: 3,
    });
    databaseBuilder.factory.learningContent.buildSkill({
      id: 'skill_tubeId2',
      tubeId: 'tubeId2',
      status: 'actif',
      level: 4,
    });
  });

  context('when the target profile exists', function () {
    it('should call targetProfileForUpdateRepository #update method', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({
        targetProfileId,
        tubeId: 'tubeId1',
        level: 3,
      });
      databaseBuilder.factory.buildTargetProfileTube({
        targetProfileId,
        tubeId: 'tubeId2',
        level: 4,
      });

      await databaseBuilder.commit();

      const attributesToUpdate = {
        name: 'new name',
        category: 'OTHER',
        description: 'new description',
        comment: 'new comment',
        imageUrl: 'http://img.org',
        areKnowledgeElementsResettable: false,
      };

      // when
      await usecases.updateTargetProfile({
        id: targetProfileId,
        attributesToUpdate,
      });

      // then
      const updatedTargetProfile = await targetProfileAdministrationRepository.get({ id: targetProfileId });
      expect(updatedTargetProfile.name).to.equal('new name');
      expect(updatedTargetProfile.category).to.equal('OTHER');
      expect(updatedTargetProfile.description).to.equal('new description');
      expect(updatedTargetProfile.comment).to.equal('new comment');
      expect(updatedTargetProfile.imageUrl).to.equal('http://img.org');
      expect(updatedTargetProfile.areKnowledgeElementsResettable).to.be.false;
    });
  });

  context('when removing a tube with a badge linked to it', function () {
    it('should throw an error', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({
        targetProfileId,
        tubeId: 'tubeId1',
        level: 3,
      });
      databaseBuilder.factory.buildTargetProfileTube({
        targetProfileId,
        tubeId: 'tubeId2',
        level: 4,
      });

      const badgeId = databaseBuilder.factory.buildBadge({ targetProfileId }).id;
      databaseBuilder.factory.buildBadgeCriterion({
        badgeId,
        scope: SCOPES.CAPPED_TUBES,
        cappedTubes: JSON.stringify([{ id: 'tubeId2', level: 4 }]),
      });

      await databaseBuilder.commit();

      const attributesToUpdate = {
        category: 'OTHER',
        tubes: [{ id: 'tubeId1', level: 3 }],
      };

      // when
      const error = await catchErr(usecases.updateTargetProfile)({
        id: targetProfileId,
        attributesToUpdate,
      });
      expect(error).to.be.an.instanceof(DomainError);
      expect(error.message).to.equal(
        'Un badge est associé à ce profil cible pour le(s) sujet(s): name Tube A (niveau 4)',
      );
    });
  });
});
