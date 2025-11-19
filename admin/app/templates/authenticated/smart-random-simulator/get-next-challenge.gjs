import pageTitle from 'ember-page-title/helpers/page-title';
import CurrentChallenge from 'pix-admin/components/smart-random-simulator/current-challenge';
import PreviousChallenges from 'pix-admin/components/smart-random-simulator/previous-challenges';
import Reset from 'pix-admin/components/smart-random-simulator/reset';
import SmartRandomParams from 'pix-admin/components/smart-random-simulator/smart-random-params';
import Start from 'pix-admin/components/smart-random-simulator/start';
import TubesViewer from 'pix-admin/components/smart-random-simulator/tubes-viewer';
<template>
  {{pageTitle "Simulateur algorithme Smart Random"}}
  <div class="page">

    <header>
      <h1>Simulateur Smart Random</h1>
    </header>

    <main class="page-body smart-random-simulator">
      <section class="admin-form__content">
        <SmartRandomParams
          @knowledgeElements={{@controller.knowledgeElements}}
          @answers={{@controller.answers}}
          @skills={{@controller.skills}}
          @challenges={{@controller.challenges}}
          @locale={{@controller.locale}}
          @assessmentId={{@controller.assessmentId}}
          @loadCampaignParams={{@controller.loadCampaignParams}}
          @updateParametersValue={{@controller.updateParametersValue}}
        />

        {{#if @controller.previousChallenges.length}}
          <PreviousChallenges @challenges={{@controller.previousChallenges}} />
        {{/if}}
      </section>

      <section>
        <section class="admin-form__content">

          {{#if @controller.assessmentComplete}}

            <Reset @reset={{@controller.reset}} />

            <TubesViewer
              @tubes={{@controller.skillsByTube}}
              @currentSkillId={{@controller.currentChallenge.skill.id}}
              @knowledgeElements={{@controller.knowledgeElements}}
              @smartRandomLog={{@controller.smartRandomLog}}
              @totalNumberOfSkills={{@controller.skills.length}}
              @numberOfSkillsStillAvailable={{@controller.numberOfSkillsStillAvailable}}
              @displayedStepIndex={{@controller.displayedStepIndex}}
              @selectDisplayedStepIndex={{@controller.selectDisplayedStepIndex}}
            />

          {{else if @controller.currentChallenge}}

            <CurrentChallenge
              @assessmentComplete={{@controller.assessmentComplete}}
              @challenge={{@controller.currentChallenge}}
              @reset={{@controller.reset}}
              @succeedCurrentChallenge={{@controller.succeedCurrentChallenge}}
              @failCurrentChallenge={{@controller.failCurrentChallenge}}
              @getNextChallenge={{@controller.getNextChallenge}}
            />

            <TubesViewer
              @tubes={{@controller.skillsByTube}}
              @currentSkillId={{@controller.currentChallenge.skill.id}}
              @knowledgeElements={{@controller.knowledgeElements}}
              @smartRandomLog={{@controller.smartRandomLog}}
              @totalNumberOfSkills={{@controller.skills.length}}
              @numberOfSkillsStillAvailable={{@controller.numberOfSkillsStillAvailable}}
              @displayedStepIndex={{@controller.displayedStepIndex}}
              @selectDisplayedStepIndex={{@controller.selectDisplayedStepIndex}}
            />

          {{else}}

            <Start @startAssessment={{@controller.startAssessment}} />

          {{/if}}
        </section>
      </section>

    </main>
  </div>
</template>
