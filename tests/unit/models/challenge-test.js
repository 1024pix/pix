import { expect } from 'chai';
import { describeModel, it } from 'ember-mocha';
import { describe } from "mocha";

describeModel(
  'challenge',
  'Unit | Model | Challenge',
  {
    needs: ['model:course']
  },
  function () {
    it('exists', function () {
      let model = this.subject();
      expect(model).to.be.ok;
    });

    describe('#proposalsAsArray', function () {

      function getProposalsAsArray(subject) {
        return subject.get('proposalsAsArray');
      }

      it('"" retourne []', function () {
        expect(getProposalsAsArray(this.subject({ proposals: '' }))).to.be.empty;
      });

      it('"malformed proposals" retourne []', function () {
        expect(getProposalsAsArray(this.subject({ proposals: 'foo' }))).to.be.empty;
      });

      it('"- foo", retourne ["foo"] ', function () {
        expect(getProposalsAsArray(this.subject({ proposals: '- foo' }))).to.deep.equal(['foo']);
      });

      it('"- foo\\n- bar", retourne ["foo", "bar"] ', function () {
        expect(getProposalsAsArray(this.subject({ proposals: '- foo\n- bar' }))).to.deep.equal(['foo', 'bar']);
      });


      it('"- cerf-volant", retourne ["cerf-volant"] ', function () {
        expect(getProposalsAsArray(this.subject({ proposals: '- cerf-volant' }))).to.deep.equal(['cerf-volant']);
      });

      it('"- shi\\n- foo mi", retourne ["shi", "foo mi"] ', function () {
        expect(getProposalsAsArray(this.subject({ proposals: '- shi\n- foo mi' }))).to.deep.equal(['shi', 'foo mi']);
      });

      it('"- joli\\n- cerf-volant", retourne ["joli", "cerf-volant"] ', function () {
        expect(getProposalsAsArray(this.subject({ proposals: '- joli\n- cerf-volant' }))).to.deep.equal(['joli', 'cerf-volant']);
      });

      it('"-foo\\n-bar", retourne ["foo", "bar"] ', function () {
        expect(getProposalsAsArray(this.subject({ proposals: '-foo\n-bar' }))).to.deep.equal(['foo', 'bar']);
      });

      it('"- shi\\n- foo\\n- mi", retourne ["shi", "foo", "mi"] ', function () {
        expect(getProposalsAsArray(this.subject({ proposals: '- shi\n- foo\n- mi' }))).to.deep.equal(['shi', 'foo', 'mi']);
      });

      it('"-- foo", retourne ["- foo"] ', function () {
        expect(getProposalsAsArray(this.subject({ proposals: '-- foo' }))).to.deep.equal(['- foo']);
      });

      it('"- foo\\n\\r\\t\n\\r\\t\\n\\r\\t\\n- bar", retourne ["foo", "bar"] ', function () {
        expect(getProposalsAsArray(this.subject({ proposals: '- foo\n\r\t\n\r\t\n\r\t\n- bar' }))).to.deep.equal(['foo', 'bar']);
      });
    });

  }
);
