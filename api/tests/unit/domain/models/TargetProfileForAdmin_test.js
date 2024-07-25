import { DomainError } from '../../../../src/shared/domain/errors.js';
import { catchErr, domainBuilder, expect } from '../../../test-helper.js';

describe('Unit | Domain | Models | TargetProfileForAdmin', function () {
  describe('#update', function () {
    context('when has a linked campaign and has tubes to update', function () {
      it('should throw an error', async function () {
        // given
        const targetProfileForAdmin = domainBuilder.buildTargetProfileForAdmin({ hasLinkedCampaign: true });

        // when
        const error = await catchErr(
          targetProfileForAdmin.update,
          targetProfileForAdmin,
        )({
          tubes: [Symbol('tube')],
        });

        // then
        expect(error).to.be.an.instanceof(DomainError);
      });
    });

    context('when the new category is not valid', function () {
      it('should throw an error', async function () {
        // given
        const targetProfileForAdmin = domainBuilder.buildTargetProfileForAdmin({ category: 'NOT VALID' });

        // when
        const error = await catchErr(
          targetProfileForAdmin.update,
          targetProfileForAdmin,
        )({
          tubes: [Symbol('tube')],
        });

        // then
        expect(error).to.be.an.instanceof(DomainError);
      });
    });

    context('happy path', function () {
      it('it should update the model', async function () {
        // given
        const targetProfileForAdmin = domainBuilder.buildTargetProfileForAdmin({
          areKnowledgeElementsResettable: false,
          category: 'CUSTOM',
          comment: '',
          description: '',
          imageUrl: 'old url',
          name: 'old name',
          tubes: [],
        });

        // when
        targetProfileForAdmin.update({
          areKnowledgeElementsResettable: true,
          category: 'OTHER',
          comment: 'new comment',
          description: 'new description',
          imageUrl: 'new url',
          name: 'new name',
          tubes: ['tube'],
        });

        // then
        expect(targetProfileForAdmin.areKnowledgeElementsResettable).to.be.true;
        expect(targetProfileForAdmin.category).to.equal('OTHER');
        expect(targetProfileForAdmin.comment).to.equal('new comment');
        expect(targetProfileForAdmin.description).to.equal('new description');
        expect(targetProfileForAdmin.imageUrl).to.equal('new url');
        expect(targetProfileForAdmin.name).to.equal('new name');
        expect(targetProfileForAdmin.tubes).to.deep.equal(['tube']);
      });
    });
  });
});
