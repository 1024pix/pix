import { PixBlock, PixButton, PixIcon, PixTag } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import convertToHtml from 'mon-pix/helpers/convert-to-html';
import stripInstruction from 'mon-pix/helpers/strip-instruction';

export default class ResultItemComponent extends Component {
  @service intl;

  get resultTooltip() {
    return this.result ? this.intl.t(`pages.comparison-window.results.${this.args.answer.result}.tooltip`) : null;
  }

  get validationImplementedForChallengeType() {
    const implementedTypes = ['QCM', 'QROC', 'QCU', 'QROCM-ind', 'QROCM-dep'];
    const challengeType = this.args.answer.get('challenge.type');
    return implementedTypes.includes(challengeType);
  }

  get textLength() {
    return window.innerWidth <= 767 ? 60 : 110;
  }

  resultIcons = {
    ok: {
      icon: 'checkCircle',
      color: 'green',
    },
    ko: {
      icon: 'cancel',
      color: 'error',
    },
    focusedOut: {
      icon: 'cancel',
      color: 'error',
    },
    aband: {
      icon: 'help',
      color: 'grey',
    },
    timedout: {
      icon: 'cancel',
      color: 'error',
    },
  };

  get result() {
    return this.resultIcons[this.args.answer.result];
  }

  get answerNumber() {
    return this.args.answerIndex + 1;
  }

  <template>
    <PixBlock class="result-item">
      {{#if this.result}}
        <h3 class="result-item__title">
          {{t "pages.result-item.question-number" number=this.answerNumber}}
          <PixTag @color={{this.result.color}}>
            <PixIcon @name={{this.result.icon}} @plainIcon={{true}} />
            {{this.resultTooltip}}
          </PixTag>
        </h3>

        <div class="result-item__content">
          <div class="result-item__instruction">
            {{stripInstruction (convertToHtml @answer.challenge.instruction) this.textLength}}
          </div>

          <div class="pix-body-xs">
            {{#if this.validationImplementedForChallengeType}}
              <PixButton @variant="tertiary" @triggerAction={{fn @openAnswerDetails @answer}}>
                {{t "pages.result-item.actions.see-answers-and-tutorials.label"}}
              </PixButton>
            {{/if}}
          </div>
        </div>
      {{/if}}
    </PixBlock>
  </template>
}
