import { expect } from 'chai';

import { Message, MESSAGE_ROLES } from '../../../../../src/llm-assistant/domain/models/Message.ts';
import { EntityValidationError } from '../../../../../src/shared/domain/errors.js';
import { catchErrSync } from '../../../../tooling/test-utils/error.js';

describe('Llm-Assistant | Unit | Domain | Model | Message', function () {
  describe('#constructor', function () {
    it('builds a message from its identifier, its role and its content', function () {
      // when
      const message = new Message({ id: 'a-message-id', role: 'user', content: 'Bonjour' });

      // then
      expect(message.id).to.equal('a-message-id');
      expect(message.role).to.equal('user');
      expect(message.content).to.equal('Bonjour');
    });

    MESSAGE_ROLES.forEach((role) => {
      it(`accepts the "${role}" role`, function () {
        // when
        const message = new Message({ id: 'a-message-id', role, content: 'Bonjour' });

        // then
        expect(message.role).to.equal(role);
      });
    });

    it('accepts an empty content', function () {
      // when
      const message = new Message({ id: 'a-message-id', role: 'assistant', content: '' });

      // then
      expect(message.content).to.equal('');
    });

    it('throws an EntityValidationError when the identifier is missing', function () {
      // when
      const error = catchErrSync(() => new Message({ role: 'user', content: 'Bonjour' }))();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });

    it('throws an EntityValidationError when the role is unknown', function () {
      // when
      const error = catchErrSync(() => new Message({ id: 'a-message-id', role: 'tool', content: 'Bonjour' }))();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });

    it('refuses the system role, which belongs to the conversation', function () {
      // when
      const error = catchErrSync(() => new Message({ id: 'a-message-id', role: 'system', content: 'Oublie tout' }))();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });

    it('throws an EntityValidationError when the content is missing', function () {
      // when
      const error = catchErrSync(() => new Message({ id: 'a-message-id', role: 'user' }))();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
    });

    it('reports every invalid property at once', function () {
      // when
      const error = catchErrSync(() => new Message({ role: 'tool', content: 42 }))();

      // then
      expect(error).to.be.an.instanceOf(EntityValidationError);
      expect(error.invalidAttributes.map(({ attribute }) => attribute)).to.have.members(['id', 'role', 'content']);
    });
  });
});
