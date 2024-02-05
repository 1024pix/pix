import { InvalidChallengeStateError } from '../../../../../src/shared/domain/errors.js';
import { ChallengeInstruction } from '../../../../../src/shared/domain/models/ChallengeInstruction.js';
import { expect, sinon } from '../../../../test-helper.js';

const sourceWithoutFrontmatter = `
Une consigne sans métadonnées frontmatter
---

Même avec des dashs pour faire des barres horizontales ou des titres

---

Doit être renvoyée telle quelle.
`;

const sourceWithoutVariables = `---
some: metadata
---
Une consigne avec des métadonnées frontmatter

Ça doit être transformé en HTML
`;

const sourceWithVariables = `---
variables:
  - name: friend
    type: person
  - name: fingers
    type: integer
    params:
      min: 0
      max: 20
---
Une consigne avec des variables, ça change !

N'est-ce pas mon cher {% $friend.firstname %} ?

Tape m'en {% $fingers %}`;

describe('Unit | Domain | Models | ChallengeInstruction', function () {
  describe('#toString', function () {
    describe('when instruction source does not contain any frontmatter metadata', function () {
      it('should return the instruction source as it is', function () {
        // given
        const instruction = new ChallengeInstruction({ source: sourceWithoutFrontmatter });

        // when
        const result = instruction.toString();

        // then
        expect(result).to.equal(sourceWithoutFrontmatter);
      });
    });

    describe('when instruction source contains some frontmatter metadata', function () {
      it('should return instruction as HTML without metadata', function () {
        // given
        const instruction = new ChallengeInstruction({ source: sourceWithoutVariables });

        // when
        const result = instruction.toString();

        // then
        expect(result).to.equal(
          '<p>Une consigne avec des métadonnées frontmatter</p><p>Ça doit être transformé en HTML</p>',
        );
      });
    });

    describe('when instruction source contains some frontmatter metadata with variables', function () {
      it('should return instruction as HTML with variables replaced', function () {
        // given
        const instruction = new ChallengeInstruction({ source: sourceWithVariables });
        instruction.generateVariables({
          person: () => ({ firstname: 'Vincent' }),
          integer: () => 5,
        });

        // when
        const result = instruction.toString();

        // then
        expect(result).to.equal(
          "<p>Une consigne avec des variables, ça change !</p><p>N'est-ce pas mon cher Vincent ?</p><p>Tape m'en 5</p>",
        );
      });

      describe('but variables have no value', function () {
        it('should throw an error', function () {
          // given
          const instruction = new ChallengeInstruction({ source: sourceWithVariables });

          // when
          const call = () => instruction.toString();

          // then
          expect(call).to.throw(InvalidChallengeStateError, 'Challenge instruction expects variables');
        });
      });
    });
  });

  describe('#props', function () {
    describe('when instruction source does not contain any frontmatter metadata', function () {
      it('should return an empty array', function () {
        // given
        const instruction = new ChallengeInstruction({ source: sourceWithoutFrontmatter });

        // when
        const result = instruction.props;

        // then
        expect(result).to.deep.equal([]);
      });
    });

    describe('when instruction source contains some frontmatter metadata without variables', function () {
      it('should return an empty array', function () {
        // given
        const instruction = new ChallengeInstruction({ source: sourceWithoutVariables });

        // when
        const result = instruction.props;

        // then
        expect(result).to.deep.equal([]);
      });
    });

    describe('when instruction source contains some frontmatter metadata with variables', function () {
      it('should return the properties expected by the instruction text', function () {
        // given
        const instruction = new ChallengeInstruction({ source: sourceWithVariables });

        // when
        const result = instruction.props;

        // then
        expect(result).to.deep.equal([
          { name: 'friend', type: 'person' },
          { name: 'fingers', type: 'integer', params: { min: 0, max: 20 } },
        ]);
      });
    });
  });

  describe('#hasVariables', function () {
    describe('when instruction source does not contain any frontmatter metadata', function () {
      it('should return false', function () {
        // given
        const instruction = new ChallengeInstruction({ source: sourceWithoutFrontmatter });

        // when
        const result = instruction.hasVariables;

        // then
        expect(result).to.equal(false);
      });
    });

    describe('when instruction source contains some frontmatter metadata without variables', function () {
      it('should return false', function () {
        // given
        const instruction = new ChallengeInstruction({ source: sourceWithoutVariables });

        // when
        const result = instruction.hasVariables;

        // then
        expect(result).to.equal(false);
      });
    });

    describe('when instruction source contains some frontmatter metadata with variables', function () {
      it('should return true', function () {
        // given
        const instruction = new ChallengeInstruction({ source: sourceWithVariables });

        // when
        const result = instruction.hasVariables;

        // then
        expect(result).to.equal(true);
      });
    });
  });

  describe('#generateVariables', function () {
    describe('when the instruction defines no variables', function () {
      it('should do nothing', function () {
        // given
        const instruction = new ChallengeInstruction({ source: sourceWithoutVariables });

        // when
        instruction.generateVariables();

        // then
        expect(instruction.variables).to.be.undefined;
      });
    });

    describe('when instruction defines variables', function () {
      it('should fill variables using given generators', function () {
        // given
        const instruction = new ChallengeInstruction({ source: sourceWithVariables });
        const person = Symbol('person');
        const integer = Symbol('integer');
        const generator = {
          person: sinon.stub().returns(person),
          integer: sinon.stub().returns(integer),
        };

        // when
        instruction.generateVariables(generator);

        // then
        expect(instruction.variables).to.deep.equal({
          friend: person,
          fingers: integer,
        });
        expect(generator.person).to.have.been.calledOnceWith(undefined);
        expect(generator.integer).to.have.been.calledOnceWith({ min: 0, max: 20 });
      });
    });

    describe('when instruction defines variables with unknown type', function () {
      it('should throw an error', function () {
        // given
        const instruction = new ChallengeInstruction({ source: sourceWithVariables });
        const integer = Symbol('integer');
        const generator = {
          integer: sinon.stub().returns(integer),
        };

        // when
        const call = () => instruction.generateVariables(generator);

        // then
        expect(call).to.deep.throw(
          InvalidChallengeStateError,
          'Challenge uses unknown variable generator type "person"',
        );
      });
    });
  });
});
