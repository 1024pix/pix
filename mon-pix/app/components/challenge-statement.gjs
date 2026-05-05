import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import { fn, get } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import eq from 'ember-truth-helpers/helpers/eq';
import sortBy from 'lodash/sortBy';
import Tooltip from 'mon-pix/components/challenge/statement/tooltip';
import ChallengeEmbedSimulator from 'mon-pix/components/challenge-embed-simulator';
import ChallengeIllustration from 'mon-pix/components/challenge-illustration';
import MarkdownToHtml from 'mon-pix/components/markdown-to-html';
import MarkdownToHtmlUnsafe from 'mon-pix/components/markdown-to-html-unsafe';
import ENV from 'mon-pix/config/environment';
import extractExtension from 'mon-pix/helpers/extract-extension';
import { SessionStorageEntry } from 'mon-pix/utils/session-storage-entry';

const certifCandidateStorage = new SessionStorageEntry('certifCandidateStorage');

const PREFERRED_ATTACHMENT_FORMATS = ['docx', 'xlsx', 'pptx'];

export default class ChallengeStatement extends Component {
  @service intl;
  @service currentUser;
  @service featureToggles;
  @service router;
  @service pixMetrics;

  @tracked selectedAttachmentUrl;
  @tracked displayAlternativeInstruction = false;
  @tracked isSpeaking = false;
  @tracked textToSpeechButtonTooltipText = this.intl.t('pages.challenge.statement.text-to-speech.play');
  @tracked textToSpeechRate = 1;

  constructor() {
    super(...arguments);
    this._initialiseDefaultAttachment();
    this.stopTextToSpeechOnLeaveOrRefresh();
  }
  get isFocusedChallengeToggleEnabled() {
    return ENV.APP.FT_FOCUS_CHALLENGE_ENABLED;
  }

  get challengeInstruction() {
    const instruction = this.args.challenge.instruction;
    return instruction ? this._formatLink(instruction) : null;
  }

  get linkTitle() {
    return this.intl.t('navigation.external-link-title');
  }

  get challengeEmbedDocument() {
    if (this.args.challenge && this.args.challenge.hasValidEmbedDocument) {
      return {
        url: this.args.challenge.embedUrl,
        title: this.args.challenge.embedTitle,
        height: this.args.challenge.embedHeight,
      };
    }
    return undefined;
  }

  get id() {
    return 'challenge_statement_' + this.args.challenge.id;
  }

  get showTextToSpeechButton() {
    const isTextToSpeechFeatureActivated =
      window.speechSynthesis &&
      this.featureToggles.featureToggles?.isTextToSpeechButtonEnabled &&
      this.args.isTextToSpeechActivated;

    const certificationCourse = this.args.assessment.belongsTo('certificationCourse').value();

    const shouldShowInAssessment =
      !this.args.assessment.isCertification || certificationCourse?.isAdjustedForAccessibility;

    return isTextToSpeechFeatureActivated && shouldShowInAssessment;
  }

  get rangeValue() {
    if (this.textToSpeechLanguage.includes('en')) {
      return {
        min: '0.5',
        max: '10',
        step: '0.5',
      };
    }

    return {
      min: '0.1',
      max: '2',
      step: '0.1',
    };
  }

  @action
  onChangeRateSpeech(event) {
    this.textToSpeechRate = event.target.value;

    if (this.isSpeaking) {
      speechSynthesis.cancel();
      this.isSpeaking = false;
      this.textToSpeechButtonTooltipText = this.intl.t('pages.challenge.statement.text-to-speech.play');
    }
  }

  @action
  toggleAlternativeInstruction() {
    this.displayAlternativeInstruction = !this.displayAlternativeInstruction;
  }

  @action
  chooseAttachmentUrl(attachementUrl) {
    this.selectedAttachmentUrl = attachementUrl;
  }

  @action
  toggleInstructionTextToSpeech(event) {
    event.preventDefault();

    if (this.isSpeaking) {
      speechSynthesis.cancel();
      this.isSpeaking = false;
      this.textToSpeechButtonTooltipText = this.intl.t('pages.challenge.statement.text-to-speech.play');
    } else {
      const element = document.getElementsByClassName('challenge-statement-instruction__text')[0];
      const textToSpeech = new SpeechSynthesisUtterance(element.innerText);

      textToSpeech.lang = this.textToSpeechLanguage;
      textToSpeech.pitch = 0.8;
      textToSpeech.rate = this.textToSpeechRate;

      textToSpeech.onend = () => {
        this.isSpeaking = false;
        this.textToSpeechButtonTooltipText = this.intl.t('pages.challenge.statement.text-to-speech.play');
      };

      this.isSpeaking = true;
      this.textToSpeechButtonTooltipText = this.intl.t('pages.challenge.statement.text-to-speech.stop');
      this.textToSpeechButtonIcon = 'circle-stop';
      speechSynthesis.speak(textToSpeech);
    }
    this.addMetrics();
  }

  get textToSpeechLanguage() {
    if (this.args.challenge.locales.length) {
      return this.args.challenge.locales[0];
    }
    if (this.currentUser.user?.lang) {
      return this.currentUser.user.lang;
    }
    return 'fr';
  }

  addMetrics() {
    this.pixMetrics.trackEvent(`Clic sur le bouton de lecture d'épreuve : ${this.isSpeaking ? 'play' : 'stop'}`, {
      disabled: true,
      category: 'Vocalisation',
      action: "Lecture d'une épreuve",
    });

    if (this.args.assessment.isCertification) {
      if (!certifCandidateStorage.get()) {
        this.pixMetrics.trackEvent('certifChallengeTextToSpeech');
        certifCandidateStorage.set('certifChallengeTextToSpeech');
      }
    }
  }

  stopTextToSpeechOnLeaveOrRefresh() {
    if (window.speechSynthesis) {
      speechSynthesis.cancel();
      this.router.on('routeWillChange', () => {
        speechSynthesis.cancel();
      });
    }
  }

  get orderedAttachments() {
    if (!this.args.challenge.attachments || !Array.isArray(this.args.challenge.attachments)) {
      return [];
    }

    return sortBy(this.args.challenge.attachments, (attachmentUrl) => {
      const extension = attachmentUrl.split('.').pop();
      const newFirstChar = PREFERRED_ATTACHMENT_FORMATS.indexOf(extension) >= 0 ? 'A' : 'Z';
      return newFirstChar + extension;
    });
  }

  _initialiseDefaultAttachment() {
    this.selectedAttachmentUrl = this.orderedAttachments[0];
  }

  _formatLink(instruction) {
    const externalLinkRegex = /(\[(.*?)\]\((.*?)\))+/g;
    return instruction.replace(externalLinkRegex, this._insertLinkTitle.bind(this));
  }

  _insertLinkTitle(markdownLink) {
    const markdownLinkWithoutLastChar = markdownLink.substring(0, markdownLink.length - 1);
    const linkDestination = markdownLink.substring(1, markdownLink.indexOf(']'));
    return `${markdownLinkWithoutLastChar} "${linkDestination} (${this.linkTitle})")`;
  }

  <template>
    <div class="challenge-statement">
      <h2 class="sr-only">{{t "pages.challenge.parts.instruction"}}</h2>
      {{#if this.challengeInstruction}}
        <div class="challenge-statement__instruction-section">
          <div class="challenge-statement__instructions-and-text-to-speech-container">
            {{#if this.showTextToSpeechButton}}
              <PixButton
                @triggerAction={{this.toggleInstructionTextToSpeech}}
                @variant="tertiary"
                @iconBefore={{if this.isSpeaking "stopCircle" "volumeOn"}}
              >
                {{this.textToSpeechButtonTooltipText}}
              </PixButton>

              <PixInput
                type="range"
                max={{this.rangeValue.max}}
                min={{this.rangeValue.min}}
                step={{this.rangeValue.step}}
                @value={{this.textToSpeechRate}}
                {{on "change" this.onChangeRateSpeech}}
              ><:label>rate</:label></PixInput>
            {{/if}}
            <MarkdownToHtmlUnsafe
              @class="challenge-statement-instruction__text"
              @markdown={{this.challengeInstruction}}
            />
            {{#if @challenge.hasValidEmbedDocument}}
              <div class="sr-only">{{t "pages.challenge.statement.sr-only.embed"}}</div>
            {{/if}}
          </div>

          {{#if @challenge.alternativeInstruction}}
            <div class="sr-only">{{t "pages.challenge.statement.sr-only.alternative-instruction"}}</div>
          {{/if}}

          {{#if this.isFocusedChallengeToggleEnabled}}
            <Tooltip @challenge={{@challenge}} />
          {{/if}}
        </div>
      {{/if}}

      {{#if @challenge.illustrationUrl}}
        <div class="challenge-statement__illustration-section">
          <ChallengeIllustration @src={{@challenge.illustrationUrl}} @alt={{@challenge.illustrationAlt}} />
        </div>
      {{/if}}

      {{#if @challenge.hasAttachment}}
        <div class="challenge-statement__attachments-section">

          {{#if @challenge.hasSingleAttachment}}
            <div class="challenge-statement__action">
              <a class="challenge-statement__action-link" href="{{get this.orderedAttachments '0'}}" download>
                <span class="challenge-statement__action-label">{{t
                    "pages.challenge.statement.file-download.actions.download"
                  }}</span>
              </a>
              <p class="challenge-statement__action-help">{{t
                  "pages.challenge.statement.file-download.help"
                  htmlSafe=true
                }}</p>
            </div>
          {{/if}}

          {{#if @challenge.hasMultipleAttachments}}
            <p class="challenge-statement__text">
              <span data-test-id="challenge-statement__text-content">{{t
                  "pages.challenge.statement.file-download.actions.choose-type"
                }}</span>
              <div class="challenge-statement__help-icon">
                <PixIcon @name="info" @plainIcon={{true}} @ariaHidden={{true}} />
                <div class="challenge-statement__help-tooltip">
                  <span class="challenge-statement__help-text">{{t
                      "pages.challenge.statement.file-download.description"
                    }}</span>
                </div>
              </div>
            </p>
            <ul class="challenge-statement__file-options">
              {{#each this.orderedAttachments as |attachmentUrl index|}}
                <li class="challenge-statement__file-option">

                  {{! This radiobutton is hidden  - SVG displayed instead - but needed to handle behaviour. }}
                  <input
                    type="radio"
                    id="attachment{{index}}"
                    class="challenge-statement__file-option_input"
                    name="attachment_selector"
                    value="{{attachmentUrl}}"
                    {{on "click" (fn this.chooseAttachmentUrl attachmentUrl)}}
                    checked="{{if (eq attachmentUrl this.selectedAttachmentUrl) 'checked'}}"
                  />

                  <label class="label-checkbox-downloadable" for="attachment{{index}}">
                    <span class="challenge-statement__file-option-label">{{t
                        "pages.challenge.statement.file-download.file-type"
                        fileExtension=(extractExtension attachmentUrl)
                      }}</span>
                  </label>

                </li>
              {{/each}}
            </ul>
            <div class="challenge-statement__action">
              <a class="challenge-statement__action-link" href="{{this.selectedAttachmentUrl}}" download>
                <span class="challenge-statement__action-label">{{t
                    "pages.challenge.statement.file-download.actions.download"
                  }}</span>
              </a>
              <p class="challenge-statement__action-help">{{t
                  "pages.challenge.statement.file-download.help"
                  htmlSafe=true
                }}</p>
            </div>
          {{/if}}
        </div>
      {{/if}}

      {{#if @challenge.hasValidEmbedDocument}}
        <ChallengeEmbedSimulator @embedDocument={{this.challengeEmbedDocument}} @assessmentId={{@assessment.id}} />
      {{/if}}

      {{#if @challenge.alternativeInstruction}}
        <div class="challenge-statement__alternative-instruction">
          <PixButton @triggerAction={{this.toggleAlternativeInstruction}}>
            {{#if this.displayAlternativeInstruction}}
              {{t "pages.challenge.statement.alternative-instruction.actions.hide"}}
            {{else}}
              {{t "pages.challenge.statement.alternative-instruction.actions.display"}}
            {{/if}}
          </PixButton>
          {{#if this.displayAlternativeInstruction}}
            <MarkdownToHtml
              class="challenge-statement__alternative-instruction-text"
              @markdown={{@challenge.alternativeInstruction}}
            />
          {{/if}}
        </div>
      {{/if}}
    </div>
  </template>
}
