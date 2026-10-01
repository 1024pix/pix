import { PixButton } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import pageTitle from 'ember-page-title/helpers/page-title';
import Bubble from 'junior/components/bubble';
import Header from 'junior/components/header';
import CompletedMissionCard from 'junior/components/mission-card/completed-mission-card';
import MissionCard from 'junior/components/mission-card/mission-card';
import RobotDialog from 'junior/components/robot-dialog';
import WidthLimitedContent from 'junior/components/width-limited-content';
<template>
  {{pageTitle (t "pages.missions.list.title")}}
  <WidthLimitedContent>
    <Header>
      <RobotDialog>
        <Bubble
          @message={{t "pages.missions.list.instruction" prenom=@controller.model.organizationLearner.firstName}}
        />
        <Bubble
          @message={{t
            "pages.missions.list.back-to-students"
            prenom=@controller.model.organizationLearner.firstName
            backUrl=@controller.schoolUrl
          }}
        />
      </RobotDialog>
    </Header>
    <div class="cards">
      {{#each @controller.orderedMissionList as |mission|}}
        <PixButton @triggerAction={{fn @controller.goToMission mission.id}} class="card">
          {{#if (@controller.isMissionCompleted mission.id)}}
            <CompletedMissionCard
              @missionLabelStatus={{t "pages.missions.list.status.completed.label"}}
              @title={{mission.name}}
              @areaCode={{mission.areaCode}}
            />
          {{else}}
            <MissionCard
              @missionLabelStatus={{@controller.getMissionLabelStatus mission.id}}
              @missionButtonLabel={{@controller.getMissionButtonLabel mission.id}}
              @title={{mission.name}}
              @areaCode={{mission.areaCode}}
              @cardImageUrl={{mission.cardImageUrl}}
              @displayStartedIcon={{@controller.isMissionStarted mission.id}}
            />
          {{/if}}
        </PixButton>
      {{/each}}
    </div>
  </WidthLimitedContent>
</template>
