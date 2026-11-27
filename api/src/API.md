This doc has been generated on 26/11/2026 10:29:54 with `scripts/generate-api-documentation.js`. See package.json.

---

## Modules

<dl>
<dt><a href="#module_UserApi">UserApi</a></dt>
<dd></dd>
<dt><a href="#module_CertificationCenterAccessApi">CertificationCenterAccessApi</a></dt>
<dd></dd>
<dt><a href="#module_CreditsApi">CreditsApi</a></dt>
<dd></dd>
<dt><a href="#module_NetworkApi">NetworkApi</a></dt>
<dd></dd>
<dt><a href="#module_OrganizationApi">OrganizationApi</a></dt>
<dd></dd>
<dt><a href="#module_OrganizationFeaturesApi">OrganizationFeaturesApi</a></dt>
<dd></dd>
<dt><a href="#module_CampaignStatsApi">CampaignStatsApi</a></dt>
<dd></dd>
<dt><a href="#module_CampaignApi">CampaignApi</a></dt>
<dd></dd>
<dt><a href="#module_OrganizationLearnerApi">OrganizationLearnerApi</a></dt>
<dd></dd>
<dt><a href="#module_OrganizationLearnerWithParticipationsApi">OrganizationLearnerWithParticipationsApi</a></dt>
<dd></dd>
<dt><a href="#module_TargetProfileApi">TargetProfileApi</a></dt>
<dd></dd>
<dt><a href="#module_CombinedCourseApi">CombinedCourseApi</a></dt>
<dd></dd>
<dt><a href="#module_OrganizationApi">OrganizationApi</a></dt>
<dd></dd>
<dt><a href="#module_UserTeamsApi">UserTeamsApi</a></dt>
<dd></dd>
</dl>

## Classes

<dl>
<dt><a href="#FrameworkDTO">FrameworkDTO</a></dt>
<dd></dd>
<dt><a href="#AreaDTO">AreaDTO</a></dt>
<dd></dd>
<dt><a href="#CompetenceDTO">CompetenceDTO</a></dt>
<dd></dd>
<dt><a href="#ThematicDTO">ThematicDTO</a></dt>
<dd></dd>
<dt><a href="#TubeDTO">TubeDTO</a></dt>
<dd></dd>
<dt><a href="#AllowedCertificationCenterAccessDTO">AllowedCertificationCenterAccessDTO</a></dt>
<dd></dd>
<dt><a href="#NetworkOrganizationDTO">NetworkOrganizationDTO</a></dt>
<dd></dd>
<dt><a href="#TubeResultLevel">TubeResultLevel</a></dt>
<dd></dd>
<dt><a href="#CompetenceResultLevels">CompetenceResultLevels</a></dt>
<dd></dd>
<dt><a href="#CampaignTubeCoverage">CampaignTubeCoverage</a></dt>
<dd></dd>
<dt><a href="#AssessmentCampaignParticipation">AssessmentCampaignParticipation</a></dt>
<dd></dd>
<dt><a href="#TubeCoverage">TubeCoverage</a></dt>
<dd></dd>
<dt><a href="#CombinedCourse">CombinedCourse</a></dt>
<dd><p>exposed CombinedCourse object from api</p>
</dd>
<dt><a href="#MembershipNotFound">MembershipNotFound</a></dt>
<dd><p>Error representing a missing membership to an organization.</p>
</dd>
<dt><a href="#OrganizationMembership">OrganizationMembership</a></dt>
<dd><p>Model representing a membership to an organization.</p>
</dd>
<dt><a href="#UserTeamsInfo">UserTeamsInfo</a></dt>
<dd><p>Model representing a user teams info.</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#hasBeenLearner">hasBeenLearner</a> ⇒ <code>Promise.&lt;boolean&gt;</code></dt>
<dd><p>Check if user has been a learner of an organization</p>
</dd>
<dt><a href="#deleteOrganizationLearnerBeforeImportFeature">deleteOrganizationLearnerBeforeImportFeature</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>delete organization learner before adding import feature</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#getByFrameworkAndDate">getByFrameworkAndDate(params)</a> ⇒ <code>Promise.&lt;(Version|null)&gt;</code></dt>
<dd></dd>
<dt><a href="#getById">getById(params)</a> ⇒ <code>Promise.&lt;(Version|null)&gt;</code></dt>
<dd></dd>
<dt><a href="#hasBeenCandidate">hasBeenCandidate(params)</a> ⇒ <code>Promise.&lt;boolean&gt;</code></dt>
<dd><p>Checks if a user has been candidate to a certification</p>
</dd>
<dt><a href="#rescoreV3Certification">rescoreV3Certification(params)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd></dd>
<dt><a href="#rescoreV2Certification">rescoreV2Certification(params)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd></dd>
<dt><a href="#selectNextCertificationChallenge">selectNextCertificationChallenge(params)</a> ⇒ <code>Promise.&lt;string&gt;</code></dt>
<dd></dd>
<dt><a href="#getAssessmentLiveAlerts">getAssessmentLiveAlerts(params)</a> ⇒ <code>Promise.&lt;{challengeLiveAlerts: Array.&lt;object&gt;, companionLiveAlerts: Array.&lt;object&gt;}&gt;</code></dt>
<dd></dd>
<dt><a href="#evaluateAndSaveAnswer">evaluateAndSaveAnswer(params)</a> ⇒ <code>Promise.&lt;Answer&gt;</code></dt>
<dd></dd>
<dt><a href="#completeCertificationAssessment">completeCertificationAssessment(params)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd></dd>
<dt><a href="#buildForSession">buildForSession(params)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd></dd>
<dt><a href="#findByUserIdAndSessionId">findByUserIdAndSessionId(params)</a> ⇒ <code>Promise.&lt;(DTOCandidateAuthorization|null)&gt;</code></dt>
<dd></dd>
<dt><a href="#onCertificationStartedOrResumed">onCertificationStartedOrResumed(params)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd></dd>
<dt><a href="#findBySessionId">findBySessionId(params)</a> ⇒ <code>Promise.&lt;(DTOSessionAuthorization|null)&gt;</code></dt>
<dd></dd>
<dt><a href="#pushEvents">pushEvents(dtoEvents)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd></dd>
<dt><a href="#getModulesByIds">getModulesByIds(params)</a> ⇒ <code>Array.&lt;Module&gt;</code></dt>
<dd></dd>
<dt><a href="#get">get(challengeId)</a> ⇒ <code>Promise.&lt;ChallengeToPlay&gt;</code></dt>
<dd></dd>
<dt><a href="#getSerializationConfig">getSerializationConfig()</a> ⇒ <code>Object</code></dt>
<dd></dd>
<dt><a href="#correctAnswer">correctAnswer(params)</a> ⇒ <code>Answer</code></dt>
<dd></dd>
<dt><a href="#findFilteredMostRecentByUser">findFilteredMostRecentByUser(payload)</a> ⇒ <code>Promise.&lt;Array.&lt;KnowledgeElementDTO&gt;&gt;</code></dt>
<dd></dd>
<dt><a href="#findByIds">findByIds()</a></dt>
<dd></dd>
<dt><a href="#findByTubeIds">findByTubeIds(params)</a> ⇒ <code>Promise.&lt;(AllTubesFoundResult|SomeTubesNotFoundResult|NoTubesProvidedResult)&gt;</code></dt>
<dd></dd>
<dt><a href="#findByIds">findByIds(params)</a> ⇒ <code>Promise.&lt;Array.&lt;SkillDTO&gt;&gt;</code></dt>
<dd></dd>
<dt><a href="#acceptLegalDocumentByUserId">acceptLegalDocumentByUserId(params)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Accepts a legal document for a user by their ID.</p>
</dd>
<dt><a href="#getLegalDocumentStatusByUserId">getLegalDocumentStatusByUserId(params)</a> ⇒ <code>Promise.&lt;LegalDocumentStatus&gt;</code></dt>
<dd><p>Gets the status of a legal document for a user by their ID.</p>
</dd>
<dt><a href="#startChat">startChat(params)</a> ⇒ <code>Promise.&lt;LLMChatDTO&gt;</code></dt>
<dd></dd>
<dt><a href="#prompt">prompt(params)</a> ⇒ <code>Promise.&lt;Readable&gt;</code></dt>
<dd></dd>
<dt><a href="#hasCampaignParticipations">hasCampaignParticipations(userId)</a> ⇒ <code>Promise.&lt;boolean&gt;</code></dt>
<dd></dd>
<dt><a href="#findByUserId">findByUserId(userId)</a> ⇒ <code>Promise.&lt;Array.&lt;{id: number, campaignId: number, targetProfileId: number}&gt;&gt;</code></dt>
<dd></dd>
<dt><a href="#getCampaignParticipationResult">getCampaignParticipationResult(params)</a> ⇒ <code>Promise.&lt;CampaignParticipationResult&gt;</code></dt>
<dd><p>Returns the mastery rate and reached levels by tube and competence for a shared participation.</p>
</dd>
<dt><a href="#getHighlightedTrainingsForCampaign">getHighlightedTrainingsForCampaign(params)</a> ⇒ <code>Promise.&lt;Array.&lt;number&gt;&gt;</code></dt>
<dd></dd>
<dt><a href="#canSelfDeleteAccount">canSelfDeleteAccount(params)</a> ⇒ <code>Promise.&lt;boolean&gt;</code></dt>
<dd><p>Determines if a user can self-delete their account.</p>
</dd>
<dt><a href="#archiveCertificationCenterData">archiveCertificationCenterData(params)</a></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#DTOCandidateAuthorization">DTOCandidateAuthorization</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#DTOSessionAuthorization">DTOSessionAuthorization</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#DTOEvent">DTOEvent</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#ModuleStatus">ModuleStatus</a> ⇒ <code><a href="#ModuleStatus">Array.&lt;ModuleStatus&gt;</a></code></dt>
<dd></dd>
<dt><a href="#KnowledgeElementDTO">KnowledgeElementDTO</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#Payload">Payload</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#NoTubesProvidedResult">NoTubesProvidedResult</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#SomeTubesNotFoundResult">SomeTubesNotFoundResult</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#AllTubesFoundResult">AllTubesFoundResult</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#SkillDTO">SkillDTO</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#CampaignListItemArgs">CampaignListItemArgs</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#CampaignTubeCoverageArgs">CampaignTubeCoverageArgs</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#CampaignParticipationArgs">CampaignParticipationArgs</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#AssessmentCampaignParticipationArgs">AssessmentCampaignParticipationArgs</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#ProfilesCollectionCampaignParticipationArgs">ProfilesCollectionCampaignParticipationArgs</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#TubeCoverageArgs">TubeCoverageArgs</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#CombinedCourseArgs">CombinedCourseArgs</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="module_UserApi"></a>

## UserApi

- [UserApi](#module_UserApi)
  - [~markNewDashboardInfoAsSeen(params)](#module_UserApi..markNewDashboardInfoAsSeen) ⇒ <code>Promise</code>
  - [~markAssessmentInstructionsInfoAsSeen(params)](#module_UserApi..markAssessmentInstructionsInfoAsSeen) ⇒ <code>Promise</code>
  - [~getActiveByUserIds(params)](#module_UserApi..getActiveByUserIds) ⇒ <code>Promise.&lt;Array.&lt;UserDTO&gt;&gt;</code>

<a name="module_UserApi..markNewDashboardInfoAsSeen"></a>

### UserApi~markNewDashboardInfoAsSeen(params) ⇒ <code>Promise</code>

**Kind**: inner method of [<code>UserApi</code>](#module_UserApi)

| Param         | Type                |
| ------------- | ------------------- |
| params        | <code>Object</code> |
| params.userId | <code>Number</code> |

<a name="module_UserApi..markAssessmentInstructionsInfoAsSeen"></a>

### UserApi~markAssessmentInstructionsInfoAsSeen(params) ⇒ <code>Promise</code>

**Kind**: inner method of [<code>UserApi</code>](#module_UserApi)

| Param         | Type                |
| ------------- | ------------------- |
| params        | <code>Object</code> |
| params.userId | <code>Number</code> |

<a name="module_UserApi..getActiveByUserIds"></a>

### UserApi~getActiveByUserIds(params) ⇒ <code>Promise.&lt;Array.&lt;UserDTO&gt;&gt;</code>

**Kind**: inner method of [<code>UserApi</code>](#module_UserApi)

| Param          | Type                              |
| -------------- | --------------------------------- |
| params         | <code>Object</code>               |
| params.userIds | <code>Array.&lt;Number&gt;</code> |

<a name="module_CertificationCenterAccessApi"></a>

## CertificationCenterAccessApi

<a name="module_CertificationCenterAccessApi..getCertificationCenterAccess"></a>

### CertificationCenterAccessApi~getCertificationCenterAccess(params) ⇒ [<code>Promise.&lt;AllowedCertificationCenterAccessDTO&gt;</code>](#AllowedCertificationCenterAccessDTO)

**Kind**: inner method of [<code>CertificationCenterAccessApi</code>](#module_CertificationCenterAccessApi)  
**Returns**: [<code>Promise.&lt;AllowedCertificationCenterAccessDTO&gt;</code>](#AllowedCertificationCenterAccessDTO) - - Certification center access information

| Param                        | Type                | Description                                                    |
| ---------------------------- | ------------------- | -------------------------------------------------------------- |
| params                       | <code>Object</code> |                                                                |
| params.certificationCenterId | <code>Number</code> | The certification center ID to retrieve access information for |

<a name="module_CreditsApi"></a>

## CreditsApi

<a name="module_CreditsApi..consumeCredit"></a>

### CreditsApi~consumeCredit(payload) ⇒ <code>Promise.&lt;void&gt;</code>

**Kind**: inner method of [<code>CreditsApi</code>](#module_CreditsApi)  
**Throws**:

- <code>NoCreditAvailableError</code>

| Param   | Type                |
| ------- | ------------------- |
| payload | <code>Object</code> |

<a name="module_NetworkApi"></a>

## NetworkApi

- [NetworkApi](#module_NetworkApi)
  - [~findNetworkOrganizations(params)](#module_NetworkApi..findNetworkOrganizations) ⇒ <code>Promise.&lt;Array.&lt;NetworkOrganizationDTO&gt;&gt;</code>
  - [~NetworkOrganizationDTO](#module_NetworkApi..NetworkOrganizationDTO) : <code>object</code>

<a name="module_NetworkApi..findNetworkOrganizations"></a>

### NetworkApi~findNetworkOrganizations(params) ⇒ <code>Promise.&lt;Array.&lt;NetworkOrganizationDTO&gt;&gt;</code>

**Kind**: inner method of [<code>NetworkApi</code>](#module_NetworkApi)  
**Returns**: <code>Promise.&lt;Array.&lt;NetworkOrganizationDTO&gt;&gt;</code> - - Organizations belonging to the network, empty when the network has none or does not exist

| Param            | Type                | Description                                  |
| ---------------- | ------------------- | -------------------------------------------- |
| params           | <code>Object</code> |                                              |
| params.networkId | <code>number</code> | The network ID to retrieve organizations for |

<a name="module_NetworkApi..NetworkOrganizationDTO"></a>

### NetworkApi~NetworkOrganizationDTO : <code>object</code>

**Kind**: inner typedef of [<code>NetworkApi</code>](#module_NetworkApi)  
**Properties**

| Name           | Type                                     |
| -------------- | ---------------------------------------- |
| organizationId | <code>number</code>                      |
| externalId     | <code>string</code> \| <code>null</code> |

<a name="module_OrganizationApi"></a>

## OrganizationApi

- [OrganizationApi](#module_OrganizationApi)
  - _static_
    - [.getOrganizationMembership(organizationId, userId)](#module_OrganizationApi.getOrganizationMembership) ⇒ [<code>Promise.&lt;OrganizationMembership&gt;</code>](#OrganizationMembership)
    - [.createProOrganizationInvitation(organizationWithEmail)](#module_OrganizationApi.createProOrganizationInvitation) ⇒ <code>Promise.&lt;void&gt;</code>
  - _inner_
    - [~getOrganization(id)](#module_OrganizationApi..getOrganization) ⇒ <code>Promise.&lt;OrganizationDTO&gt;</code>
    - [~OrganizationDTO](#module_OrganizationApi..OrganizationDTO) : <code>object</code>
    - [~NotFoundError](#module_OrganizationApi..NotFoundError) : <code>object</code>

<a name="module_OrganizationApi.getOrganizationMembership"></a>

### OrganizationApi.getOrganizationMembership(organizationId, userId) ⇒ [<code>Promise.&lt;OrganizationMembership&gt;</code>](#OrganizationMembership)

**Kind**: static method of [<code>OrganizationApi</code>](#module_OrganizationApi)  
**Throws**:

- [<code>MembershipNotFound</code>](#MembershipNotFound)

| Param          | Type                |
| -------------- | ------------------- |
| organizationId | <code>number</code> |
| userId         | <code>number</code> |

<a name="module_OrganizationApi.createProOrganizationInvitation"></a>

### OrganizationApi.createProOrganizationInvitation(organizationWithEmail) ⇒ <code>Promise.&lt;void&gt;</code>

**Kind**: static method of [<code>OrganizationApi</code>](#module_OrganizationApi)

| Param                 | Type                |
| --------------------- | ------------------- |
| organizationWithEmail | <code>object</code> |

<a name="module_OrganizationApi..getOrganization"></a>

### OrganizationApi~getOrganization(id) ⇒ <code>Promise.&lt;OrganizationDTO&gt;</code>

**Kind**: inner method of [<code>OrganizationApi</code>](#module_OrganizationApi)  
**Throws**:

- <code>NotFoundError</code> if organization does not exist

| Param | Type                |
| ----- | ------------------- |
| id    | <code>number</code> |

<a name="module_OrganizationApi..OrganizationDTO"></a>

### OrganizationApi~OrganizationDTO : <code>object</code>

**Kind**: inner typedef of [<code>OrganizationApi</code>](#module_OrganizationApi)  
**Properties**

| Name               | Type                 |
| ------------------ | -------------------- |
| id                 | <code>number</code>  |
| name               | <code>string</code>  |
| type               | <code>string</code>  |
| logoUrl            | <code>string</code>  |
| isManagingStudents | <code>boolean</code> |
| identityProvider   | <code>string</code>  |

<a name="module_OrganizationApi..NotFoundError"></a>

### OrganizationApi~NotFoundError : <code>object</code>

**Kind**: inner typedef of [<code>OrganizationApi</code>](#module_OrganizationApi)  
**Properties**

| Name    | Type                |
| ------- | ------------------- |
| message | <code>string</code> |
| code    | <code>string</code> |

<a name="module_OrganizationFeaturesApi"></a>

## OrganizationFeaturesApi

- [OrganizationFeaturesApi](#module_OrganizationFeaturesApi)
  - [~getAllFeaturesFromOrganization(organizationId)](#module_OrganizationFeaturesApi..getAllFeaturesFromOrganization) ⇒ <code>Promise.&lt;OrganizationFeaturesDTO&gt;</code>
  - [~OrganizationFeatureItemDTO](#module_OrganizationFeaturesApi..OrganizationFeatureItemDTO) : <code>object</code>
  - [~OrganizationFeaturesDTO](#module_OrganizationFeaturesApi..OrganizationFeaturesDTO) : <code>object</code>

<a name="module_OrganizationFeaturesApi..getAllFeaturesFromOrganization"></a>

### OrganizationFeaturesApi~getAllFeaturesFromOrganization(organizationId) ⇒ <code>Promise.&lt;OrganizationFeaturesDTO&gt;</code>

**Kind**: inner method of [<code>OrganizationFeaturesApi</code>](#module_OrganizationFeaturesApi)

| Param          | Type                |
| -------------- | ------------------- |
| organizationId | <code>number</code> |

<a name="module_OrganizationFeaturesApi..OrganizationFeatureItemDTO"></a>

### OrganizationFeaturesApi~OrganizationFeatureItemDTO : <code>object</code>

**Kind**: inner typedef of [<code>OrganizationFeaturesApi</code>](#module_OrganizationFeaturesApi)  
**Properties**

| Name   | Type                                                     |
| ------ | -------------------------------------------------------- |
| name   | <code>string</code>                                      |
| params | <code>object</code> \| <code>Array.&lt;string&gt;</code> |

<a name="module_OrganizationFeaturesApi..OrganizationFeaturesDTO"></a>

### OrganizationFeaturesApi~OrganizationFeaturesDTO : <code>object</code>

**Kind**: inner typedef of [<code>OrganizationFeaturesApi</code>](#module_OrganizationFeaturesApi)  
**Properties**

| Name                     | Type                                                  |
| ------------------------ | ----------------------------------------------------- |
| features                 | <code>Array.&lt;OrganizationFeatureItemDTO&gt;</code> |
| hasLearnersImportFeature | <code>boolean</code>                                  |
| hasOralizationFeature    | <code>boolean</code>                                  |

<a name="module_CampaignStatsApi"></a>

## CampaignStatsApi

<a name="module_CampaignStatsApi..getOrganizationParticipantsStatistics"></a>

### CampaignStatsApi~getOrganizationParticipantsStatistics(organizationId) ⇒ <code>Promise.&lt;OrganizationStatistics&gt;</code>

**Kind**: inner method of [<code>CampaignStatsApi</code>](#module_CampaignStatsApi)

| Param          | Type                |
| -------------- | ------------------- |
| organizationId | <code>number</code> |

<a name="module_CampaignApi"></a>

## CampaignApi

- [CampaignApi](#module_CampaignApi)
  - [~save(campaigns, options)](#module_CampaignApi..save) ⇒ <code>Promise.&lt;(SavedCampaign\|Array.&lt;CampaignPayload&gt;)&gt;</code>
  - [~get(campaignId)](#module_CampaignApi..get) ⇒ <code>Promise.&lt;Campaign&gt;</code>
  - [~getByCampaignParticipationId(campaignParticipationId)](#module_CampaignApi..getByCampaignParticipationId) ⇒ <code>Promise.&lt;(Campaign\|null)&gt;</code>
  - [~getByCode(code, string)](#module_CampaignApi..getByCode) ⇒ <code>Promise.&lt;Campaign&gt;</code>
  - [~update(payload)](#module_CampaignApi..update) ⇒ <code>Promise.&lt;Campaign&gt;</code>
  - [~findAllForOrganization(payload)](#module_CampaignApi..findAllForOrganization) ⇒ <code>Promise.&lt;CampaignListResponse&gt;</code>
  - [~findAllSummariesForOrganization(payload)](#module_CampaignApi..findAllSummariesForOrganization) ⇒ <code>Promise.&lt;CampaignListResponse&gt;</code>
  - [~findCampaignSkillIdsForCampaignParticipations(campaignParticipationIds)](#module_CampaignApi..findCampaignSkillIdsForCampaignParticipations) ⇒ <code>Promise.&lt;Array.&lt;Number&gt;&gt;</code>
  - [~getCampaignParticipations(payload)](#module_CampaignApi..getCampaignParticipations) ⇒ <code>Promise.&lt;{models: (Array.&lt;AssessmentCampaignParticipationAPI&gt;\|Array.&lt;ProfilesCollectionCampaignParticipationAPI&gt;), meta: Pagination}&gt;</code>
  - [~deleteActiveCampaigns(payload)](#module_CampaignApi..deleteActiveCampaigns) ⇒ <code>Promise.&lt;void&gt;</code>
  - [~getCampaignOverviews(organizationIds)](#module_CampaignApi..getCampaignOverviews) ⇒ <code>Promise.&lt;Array.&lt;CampaignOverviewDTO&gt;&gt;</code>
  - [~getCampaignOverview(params)](#module_CampaignApi..getCampaignOverview) ⇒ <code>Promise.&lt;(CampaignOverviewWithCompetencesDTO\|null)&gt;</code>
  - [~CampaignPayload](#module_CampaignApi..CampaignPayload) : <code>object</code>
  - [~UserNotAuthorizedToCreateCampaignError](#module_CampaignApi..UserNotAuthorizedToCreateCampaignError) : <code>object</code>
  - [~CampaignCreationOptions](#module_CampaignApi..CampaignCreationOptions) : <code>object</code>
  - [~UpdateCampaignPayload](#module_CampaignApi..UpdateCampaignPayload) : <code>object</code>
  - [~PageDefinition](#module_CampaignApi..PageDefinition) : <code>object</code>
  - [~CampaignListPayload](#module_CampaignApi..CampaignListPayload) : <code>object</code>
  - [~Pagination](#module_CampaignApi..Pagination) : <code>object</code>
  - [~CampaignListResponse](#module_CampaignApi..CampaignListResponse) : <code>object</code>
  - [~CampaignSummaryListPayload](#module_CampaignApi..CampaignSummaryListPayload) : <code>object</code>
  - [~CampaignParticipationsPayload](#module_CampaignApi..CampaignParticipationsPayload) : <code>object</code>
  - [~DeleteActiveCampaignPayload](#module_CampaignApi..DeleteActiveCampaignPayload) : <code>object</code>

<a name="module_CampaignApi..save"></a>

### CampaignApi~save(campaigns, options) ⇒ <code>Promise.&lt;(SavedCampaign\|Array.&lt;CampaignPayload&gt;)&gt;</code>

**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)  
**Throws**:

- <code>UserNotAuthorizedToCreateCampaignError</code> to be improved to handle different error types

| Param     | Type                                                                       |
| --------- | -------------------------------------------------------------------------- |
| campaigns | <code>CampaignPayload</code> \| <code>Array.&lt;CampaignPayload&gt;</code> |
| options   | <code>CampaignCreationOptions</code>                                       |

<a name="module_CampaignApi..get"></a>

### CampaignApi~get(campaignId) ⇒ <code>Promise.&lt;Campaign&gt;</code>

**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)

| Param      | Type                |
| ---------- | ------------------- |
| campaignId | <code>number</code> |

<a name="module_CampaignApi..getByCampaignParticipationId"></a>

### CampaignApi~getByCampaignParticipationId(campaignParticipationId) ⇒ <code>Promise.&lt;(Campaign\|null)&gt;</code>

**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)

| Param                   | Type                |
| ----------------------- | ------------------- |
| campaignParticipationId | <code>number</code> |

<a name="module_CampaignApi..getByCode"></a>

### CampaignApi~getByCode(code, string) ⇒ <code>Promise.&lt;Campaign&gt;</code>

**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)

| Param  | Type                |
| ------ | ------------------- |
| code   | <code>number</code> |
| string | <code>locale</code> |

<a name="module_CampaignApi..update"></a>

### CampaignApi~update(payload) ⇒ <code>Promise.&lt;Campaign&gt;</code>

**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)

| Param   | Type                               |
| ------- | ---------------------------------- |
| payload | <code>UpdateCampaignPayload</code> |

<a name="module_CampaignApi..findAllForOrganization"></a>

### CampaignApi~findAllForOrganization(payload) ⇒ <code>Promise.&lt;CampaignListResponse&gt;</code>

**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)

| Param   | Type                             |
| ------- | -------------------------------- |
| payload | <code>CampaignListPayload</code> |

<a name="module_CampaignApi..findAllSummariesForOrganization"></a>

### CampaignApi~findAllSummariesForOrganization(payload) ⇒ <code>Promise.&lt;CampaignListResponse&gt;</code>

Lists an organization's campaigns with only their core attributes (no participation
counts or owner joins).
Can include the targetProfileName if withTargetProfileName is true

**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)

| Param   | Type                                    |
| ------- | --------------------------------------- |
| payload | <code>CampaignSummaryListPayload</code> |

<a name="module_CampaignApi..findCampaignSkillIdsForCampaignParticipations"></a>

### CampaignApi~findCampaignSkillIdsForCampaignParticipations(campaignParticipationIds) ⇒ <code>Promise.&lt;Array.&lt;Number&gt;&gt;</code>

**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)

| Param                    | Type                              |
| ------------------------ | --------------------------------- |
| campaignParticipationIds | <code>Array.&lt;Number&gt;</code> |

<a name="module_CampaignApi..getCampaignParticipations"></a>

### CampaignApi~getCampaignParticipations(payload) ⇒ <code>Promise.&lt;{models: (Array.&lt;AssessmentCampaignParticipationAPI&gt;\|Array.&lt;ProfilesCollectionCampaignParticipationAPI&gt;), meta: Pagination}&gt;</code>

**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)

| Param   | Type                                       |
| ------- | ------------------------------------------ |
| payload | <code>CampaignParticipationsPayload</code> |

<a name="module_CampaignApi..deleteActiveCampaigns"></a>

### CampaignApi~deleteActiveCampaigns(payload) ⇒ <code>Promise.&lt;void&gt;</code>

**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)

| Param   | Type                                     |
| ------- | ---------------------------------------- |
| payload | <code>DeleteActiveCampaignPayload</code> |

<a name="module_CampaignApi..getCampaignOverviews"></a>

### CampaignApi~getCampaignOverviews(organizationIds) ⇒ <code>Promise.&lt;Array.&lt;CampaignOverviewDTO&gt;&gt;</code>

**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)

| Param           | Type                              |
| --------------- | --------------------------------- |
| organizationIds | <code>Array.&lt;Number&gt;</code> |

<a name="module_CampaignApi..getCampaignOverview"></a>

### CampaignApi~getCampaignOverview(params) ⇒ <code>Promise.&lt;(CampaignOverviewWithCompetencesDTO\|null)&gt;</code>

Returns the campaign overview with the competences of its learning content and their max level:

- ASSESSMENT: competences of the target profile, max level is the average of the tubes max level
- PROFILES_COLLECTION: all Pix competences, max level is MAX_REACHABLE_LEVEL

**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)  
**Returns**: <code>Promise.&lt;(CampaignOverviewWithCompetencesDTO\|null)&gt;</code> - null when the campaign is not found

| Param             | Type                | Default                                    |
| ----------------- | ------------------- | ------------------------------------------ |
| params            | <code>Object</code> |                                            |
| params.campaignId | <code>number</code> |                                            |
| [params.locale]   | <code>string</code> | <code>&quot;&#x27;fr-FR&#x27;&quot;</code> |

<a name="module_CampaignApi..CampaignPayload"></a>

### CampaignApi~CampaignPayload : <code>object</code>

**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name                  | Type                |
| --------------------- | ------------------- |
| name                  | <code>string</code> |
| title                 | <code>string</code> |
| targetProfileId       | <code>number</code> |
| organizationId        | <code>number</code> |
| creatorId             | <code>number</code> |
| customLandingPageText | <code>string</code> |

<a name="module_CampaignApi..UserNotAuthorizedToCreateCampaignError"></a>

### CampaignApi~UserNotAuthorizedToCreateCampaignError : <code>object</code>

**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name    | Type                |
| ------- | ------------------- |
| message | <code>string</code> |

<a name="module_CampaignApi..CampaignCreationOptions"></a>

### CampaignApi~CampaignCreationOptions : <code>object</code>

**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name                                   | Type                 |
| -------------------------------------- | -------------------- |
| allowCreationWithoutTargetProfileShare | <code>boolean</code> |

<a name="module_CampaignApi..UpdateCampaignPayload"></a>

### CampaignApi~UpdateCampaignPayload : <code>object</code>

**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name                  | Type                |
| --------------------- | ------------------- |
| campaignId            | <code>number</code> |
| name                  | <code>string</code> |
| title                 | <code>string</code> |
| customLandingPageText | <code>string</code> |

<a name="module_CampaignApi..PageDefinition"></a>

### CampaignApi~PageDefinition : <code>object</code>

**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name   | Type                |
| ------ | ------------------- |
| size   | <code>number</code> |
| number | <code>Page</code>   |

<a name="module_CampaignApi..CampaignListPayload"></a>

### CampaignApi~CampaignListPayload : <code>object</code>

**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name           | Type                        |
| -------------- | --------------------------- |
| organizationId | <code>number</code>         |
| page           | <code>PageDefinition</code> |
| withCoverRate  | <code>boolean</code>        |

<a name="module_CampaignApi..Pagination"></a>

### CampaignApi~Pagination : <code>object</code>

**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name      | Type                |
| --------- | ------------------- |
| page      | <code>number</code> |
| pageSize  | <code>number</code> |
| rowCount  | <code>number</code> |
| pageCount | <code>number</code> |

<a name="module_CampaignApi..CampaignListResponse"></a>

### CampaignApi~CampaignListResponse : <code>object</code>

**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name   | Type                                        |
| ------ | ------------------------------------------- |
| models | <code>Array.&lt;CampaignListItem&gt;</code> |
| meta   | <code>Pagination</code>                     |

<a name="module_CampaignApi..CampaignSummaryListPayload"></a>

### CampaignApi~CampaignSummaryListPayload : <code>object</code>

**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name                  | Type                        |
| --------------------- | --------------------------- |
| organizationId        | <code>number</code>         |
| withTargetProfileName | <code>boolean</code>        |
| withArchived          | <code>boolean</code>        |
| page                  | <code>PageDefinition</code> |

<a name="module_CampaignApi..CampaignParticipationsPayload"></a>

### CampaignApi~CampaignParticipationsPayload : <code>object</code>

**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name       | Type                              |
| ---------- | --------------------------------- |
| campaignId | <code>number</code>               |
| since      | <code>string</code>               |
| sort       | <code>Array.&lt;object&gt;</code> |
| page       | <code>PageDefinition</code>       |

<a name="module_CampaignApi..DeleteActiveCampaignPayload"></a>

### CampaignApi~DeleteActiveCampaignPayload : <code>object</code>

**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name           | Type                              |
| -------------- | --------------------------------- |
| organizationId | <code>number</code>               |
| campaignIds    | <code>Array.&lt;number&gt;</code> |
| userId         | <code>number</code>               |
| page           | <code>PageDefinition</code>       |

<a name="module_OrganizationLearnerApi"></a>

## OrganizationLearnerApi

- [OrganizationLearnerApi](#module_OrganizationLearnerApi)
  - [~find(payload)](#module_OrganizationLearnerApi..find) ⇒ <code>Promise.&lt;OrganizationLearnerListResponse&gt;</code>
  - [~findByDivisions(payload)](#module_OrganizationLearnerApi..findByDivisions) ⇒ <code>Promise.&lt;{organizationLearners: Array.&lt;OrganizationLearnerForCertificationResult&gt;}&gt;</code>
  - [~get(organizationLearnerId)](#module_OrganizationLearnerApi..get) ⇒ <code>Promise.&lt;OrganizationLearner&gt;</code>
  - [~findByUserId(userId)](#module_OrganizationLearnerApi..findByUserId) ⇒ <code>Promise.&lt;Array.&lt;OrganizationLearner&gt;&gt;</code>
  - [~PageDefinition](#module_OrganizationLearnerApi..PageDefinition) : <code>object</code>
  - [~FilterDefinition](#module_OrganizationLearnerApi..FilterDefinition) : <code>object</code>
  - [~OrganizationLearnerListPayload](#module_OrganizationLearnerApi..OrganizationLearnerListPayload) : <code>object</code>
  - [~Pagination](#module_OrganizationLearnerApi..Pagination) : <code>object</code>
  - [~OrganizationLearner](#module_OrganizationLearnerApi..OrganizationLearner) : <code>object</code>
  - [~OrganizationLearnerListResponse](#module_OrganizationLearnerApi..OrganizationLearnerListResponse) : <code>object</code>

<a name="module_OrganizationLearnerApi..find"></a>

### OrganizationLearnerApi~find(payload) ⇒ <code>Promise.&lt;OrganizationLearnerListResponse&gt;</code>

Récupère les organization-learners pour une organization. Par défaut, ces organizations-learners sont triés par prénom puis par nom.
Si le params 'page' est présent, les organization-learners seront paginés
Si le params 'filter' est présent, les organization-learners seront filtrés
Le filtre 'divisions' et la division retournée portent sur l'attribut 'Libellé classe' des learners importés pour Pix Junior

**Kind**: inner method of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)

| Param   | Type                                        |
| ------- | ------------------------------------------- |
| payload | <code>OrganizationLearnerListPayload</code> |

<a name="module_OrganizationLearnerApi..findByDivisions"></a>

### OrganizationLearnerApi~findByDivisions(payload) ⇒ <code>Promise.&lt;{organizationLearners: Array.&lt;OrganizationLearnerForCertificationResult&gt;}&gt;</code>

Récupère les organization-learners actifs d'une organization appartenant à l'une des divisions données (insensible à la casse).
Par défaut, ces organizations-learners sont triés par prénom puis par nom.

**Kind**: inner method of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)

| Param                  | Type                              |
| ---------------------- | --------------------------------- |
| payload                | <code>object</code>               |
| payload.organizationId | <code>number</code>               |
| payload.divisions      | <code>Array.&lt;string&gt;</code> |

<a name="module_OrganizationLearnerApi..get"></a>

### OrganizationLearnerApi~get(organizationLearnerId) ⇒ <code>Promise.&lt;OrganizationLearner&gt;</code>

**Kind**: inner method of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)

| Param                 | Type                |
| --------------------- | ------------------- |
| organizationLearnerId | <code>number</code> |

<a name="module_OrganizationLearnerApi..findByUserId"></a>

### OrganizationLearnerApi~findByUserId(userId) ⇒ <code>Promise.&lt;Array.&lt;OrganizationLearner&gt;&gt;</code>

return organization learners link to a given userId

**Kind**: inner method of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)

| Param  | Type                |
| ------ | ------------------- |
| userId | <code>number</code> |

<a name="module_OrganizationLearnerApi..PageDefinition"></a>

### OrganizationLearnerApi~PageDefinition : <code>object</code>

**Kind**: inner typedef of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  
**Properties**

| Name   | Type                |
| ------ | ------------------- |
| size   | <code>number</code> |
| number | <code>number</code> |

<a name="module_OrganizationLearnerApi..FilterDefinition"></a>

### OrganizationLearnerApi~FilterDefinition : <code>object</code>

**Kind**: inner typedef of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  
**Properties**

| Name        | Type                              |
| ----------- | --------------------------------- |
| [divisions] | <code>Array.&lt;string&gt;</code> |
| [name]      | <code>string</code>               |

<a name="module_OrganizationLearnerApi..OrganizationLearnerListPayload"></a>

### OrganizationLearnerApi~OrganizationLearnerListPayload : <code>object</code>

**Kind**: inner typedef of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  
**Properties**

| Name           | Type                          |
| -------------- | ----------------------------- |
| organizationId | <code>number</code>           |
| [page]         | <code>PageDefinition</code>   |
| [filter]       | <code>FilterDefinition</code> |

<a name="module_OrganizationLearnerApi..Pagination"></a>

### OrganizationLearnerApi~Pagination : <code>object</code>

**Kind**: inner typedef of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  
**Properties**

| Name      | Type                |
| --------- | ------------------- |
| page      | <code>number</code> |
| pageSize  | <code>number</code> |
| rowCount  | <code>number</code> |
| pageCount | <code>number</code> |

<a name="module_OrganizationLearnerApi..OrganizationLearner"></a>

### OrganizationLearnerApi~OrganizationLearner : <code>object</code>

**Kind**: inner typedef of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  
**Properties**

| Name           | Type                |
| -------------- | ------------------- |
| id             | <code>number</code> |
| firstName      | <code>string</code> |
| lastName       | <code>string</code> |
| division       | <code>string</code> |
| organizationId | <code>number</code> |

<a name="module_OrganizationLearnerApi..OrganizationLearnerListResponse"></a>

### OrganizationLearnerApi~OrganizationLearnerListResponse : <code>object</code>

**Kind**: inner typedef of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  
**Properties**

| Name                 | Type                                              |
| -------------------- | ------------------------------------------------- |
| organizationLearners | <code>Array.&lt;OrganizationLearner&gt;</code>    |
| pagination           | <code>Pagination</code> \| <code>undefined</code> |

<a name="module_OrganizationLearnerWithParticipationsApi"></a>

## OrganizationLearnerWithParticipationsApi

- [OrganizationLearnerWithParticipationsApi](#module_OrganizationLearnerWithParticipationsApi)
  - [~find(payload)](#module_OrganizationLearnerWithParticipationsApi..find) ⇒ <code>Promise.&lt;Array.&lt;OrganizationLearnerWithParticipations&gt;&gt;</code>
  - [~FindPayload](#module_OrganizationLearnerWithParticipationsApi..FindPayload) : <code>object</code>
  - [~OrganizationLearner](#module_OrganizationLearnerWithParticipationsApi..OrganizationLearner) : <code>object</code>
  - [~Organization](#module_OrganizationLearnerWithParticipationsApi..Organization) : <code>object</code>
  - [~CampaignParticipation](#module_OrganizationLearnerWithParticipationsApi..CampaignParticipation) : <code>object</code>
  - [~OrganizationLearnerWithParticipations](#module_OrganizationLearnerWithParticipationsApi..OrganizationLearnerWithParticipations) : <code>object</code>

<a name="module_OrganizationLearnerWithParticipationsApi..find"></a>

### OrganizationLearnerWithParticipationsApi~find(payload) ⇒ <code>Promise.&lt;Array.&lt;OrganizationLearnerWithParticipations&gt;&gt;</code>

Récupère les organizations-learners avec leurs participations à partir d'une liste d'ids d'utilisateurs

**Kind**: inner method of [<code>OrganizationLearnerWithParticipationsApi</code>](#module_OrganizationLearnerWithParticipationsApi)

| Param   | Type                     |
| ------- | ------------------------ |
| payload | <code>FindPayload</code> |

<a name="module_OrganizationLearnerWithParticipationsApi..FindPayload"></a>

### OrganizationLearnerWithParticipationsApi~FindPayload : <code>object</code>

**Kind**: inner typedef of [<code>OrganizationLearnerWithParticipationsApi</code>](#module_OrganizationLearnerWithParticipationsApi)  
**Properties**

| Name    | Type                              |
| ------- | --------------------------------- |
| userIds | <code>Array.&lt;number&gt;</code> |

<a name="module_OrganizationLearnerWithParticipationsApi..OrganizationLearner"></a>

### OrganizationLearnerWithParticipationsApi~OrganizationLearner : <code>object</code>

**Kind**: inner typedef of [<code>OrganizationLearnerWithParticipationsApi</code>](#module_OrganizationLearnerWithParticipationsApi)  
**Properties**

| Name    | Type                |
| ------- | ------------------- |
| id      | <code>number</code> |
| MEFCode | <code>string</code> |

<a name="module_OrganizationLearnerWithParticipationsApi..Organization"></a>

### OrganizationLearnerWithParticipationsApi~Organization : <code>object</code>

**Kind**: inner typedef of [<code>OrganizationLearnerWithParticipationsApi</code>](#module_OrganizationLearnerWithParticipationsApi)  
**Properties**

| Name               | Type                              |
| ------------------ | --------------------------------- |
| isManagingStudents | <code>boolean</code>              |
| tags               | <code>Array.&lt;string&gt;</code> |
| type               | <code>string</code>               |

<a name="module_OrganizationLearnerWithParticipationsApi..CampaignParticipation"></a>

### OrganizationLearnerWithParticipationsApi~CampaignParticipation : <code>object</code>

**Kind**: inner typedef of [<code>OrganizationLearnerWithParticipationsApi</code>](#module_OrganizationLearnerWithParticipationsApi)  
**Properties**

| Name            | Type                |
| --------------- | ------------------- |
| id              | <code>number</code> |
| targetProfileId | <code>number</code> |
| status          | <code>string</code> |
| campaignName    | <code>string</code> |

<a name="module_OrganizationLearnerWithParticipationsApi..OrganizationLearnerWithParticipations"></a>

### OrganizationLearnerWithParticipationsApi~OrganizationLearnerWithParticipations : <code>object</code>

**Kind**: inner typedef of [<code>OrganizationLearnerWithParticipationsApi</code>](#module_OrganizationLearnerWithParticipationsApi)  
**Properties**

| Name                   | Type                                             |
| ---------------------- | ------------------------------------------------ |
| organizationLearner    | <code>OrganizationLearner</code>                 |
| organization           | <code>Organization</code>                        |
| campaignParticipations | <code>Array.&lt;CampaignParticipation&gt;</code> |

<a name="module_TargetProfileApi"></a>

## TargetProfileApi

- [TargetProfileApi](#module_TargetProfileApi)
  - [~getByOrganizationId(organizationId)](#module_TargetProfileApi..getByOrganizationId) ⇒ <code>Promise.&lt;Array.&lt;TargetProfile&gt;&gt;</code>
  - [~getByIdForAdmin(id)](#module_TargetProfileApi..getByIdForAdmin) ⇒ <code>Promise.&lt;TargetProfile&gt;</code>
  - [~getById(id)](#module_TargetProfileApi..getById) ⇒ <code>Promise.&lt;TargetProfile&gt;</code>
  - [~getByIds(targetProfileIds)](#module_TargetProfileApi..getByIds) ⇒ <code>Promise.&lt;Array.&lt;TargetProfile&gt;&gt;</code>
  - [~findSkillByTargetProfileIds(targetProfilsIds)](#module_TargetProfileApi..findSkillByTargetProfileIds) ⇒ <code>Promise.&lt;Array.&lt;TargetProfileSkill&gt;&gt;</code>
  - [~findCappedTubesForTargetProfileIds(targetProfileIds)](#module_TargetProfileApi..findCappedTubesForTargetProfileIds) ⇒ <code>Promise.&lt;Array.&lt;TargetProfileCappedTube&gt;&gt;</code>

<a name="module_TargetProfileApi..getByOrganizationId"></a>

### TargetProfileApi~getByOrganizationId(organizationId) ⇒ <code>Promise.&lt;Array.&lt;TargetProfile&gt;&gt;</code>

**Kind**: inner method of [<code>TargetProfileApi</code>](#module_TargetProfileApi)

| Param          | Type                |
| -------------- | ------------------- |
| organizationId | <code>number</code> |

<a name="module_TargetProfileApi..getByIdForAdmin"></a>

### TargetProfileApi~getByIdForAdmin(id) ⇒ <code>Promise.&lt;TargetProfile&gt;</code>

**Kind**: inner method of [<code>TargetProfileApi</code>](#module_TargetProfileApi)

| Param | Type                |
| ----- | ------------------- |
| id    | <code>number</code> |

<a name="module_TargetProfileApi..getById"></a>

### TargetProfileApi~getById(id) ⇒ <code>Promise.&lt;TargetProfile&gt;</code>

**Kind**: inner method of [<code>TargetProfileApi</code>](#module_TargetProfileApi)

| Param | Type                |
| ----- | ------------------- |
| id    | <code>number</code> |

<a name="module_TargetProfileApi..getByIds"></a>

### TargetProfileApi~getByIds(targetProfileIds) ⇒ <code>Promise.&lt;Array.&lt;TargetProfile&gt;&gt;</code>

**Kind**: inner method of [<code>TargetProfileApi</code>](#module_TargetProfileApi)

| Param            | Type                              |
| ---------------- | --------------------------------- |
| targetProfileIds | <code>Array.&lt;number&gt;</code> |

<a name="module_TargetProfileApi..findSkillByTargetProfileIds"></a>

### TargetProfileApi~findSkillByTargetProfileIds(targetProfilsIds) ⇒ <code>Promise.&lt;Array.&lt;TargetProfileSkill&gt;&gt;</code>

**Kind**: inner method of [<code>TargetProfileApi</code>](#module_TargetProfileApi)

| Param            | Type                              |
| ---------------- | --------------------------------- |
| targetProfilsIds | <code>Array.&lt;number&gt;</code> |

<a name="module_TargetProfileApi..findCappedTubesForTargetProfileIds"></a>

### TargetProfileApi~findCappedTubesForTargetProfileIds(targetProfileIds) ⇒ <code>Promise.&lt;Array.&lt;TargetProfileCappedTube&gt;&gt;</code>

**Kind**: inner method of [<code>TargetProfileApi</code>](#module_TargetProfileApi)

| Param            | Type                              |
| ---------------- | --------------------------------- |
| targetProfileIds | <code>Array.&lt;number&gt;</code> |

<a name="module_CombinedCourseApi"></a>

## CombinedCourseApi

<a name="module_CombinedCourseApi..getByCampaignId"></a>

### CombinedCourseApi~getByCampaignId(campaignId) ⇒ [<code>Promise.&lt;CombinedCourse&gt;</code>](#CombinedCourse)

**Kind**: inner method of [<code>CombinedCourseApi</code>](#module_CombinedCourseApi)

| Param      | Type                |
| ---------- | ------------------- |
| campaignId | <code>number</code> |

<a name="module_OrganizationApi"></a>

## OrganizationApi

- [OrganizationApi](#module_OrganizationApi)
  - _static_
    - [.getOrganizationMembership(organizationId, userId)](#module_OrganizationApi.getOrganizationMembership) ⇒ [<code>Promise.&lt;OrganizationMembership&gt;</code>](#OrganizationMembership)
    - [.createProOrganizationInvitation(organizationWithEmail)](#module_OrganizationApi.createProOrganizationInvitation) ⇒ <code>Promise.&lt;void&gt;</code>
  - _inner_
    - [~getOrganization(id)](#module_OrganizationApi..getOrganization) ⇒ <code>Promise.&lt;OrganizationDTO&gt;</code>
    - [~OrganizationDTO](#module_OrganizationApi..OrganizationDTO) : <code>object</code>
    - [~NotFoundError](#module_OrganizationApi..NotFoundError) : <code>object</code>

<a name="module_OrganizationApi.getOrganizationMembership"></a>

### OrganizationApi.getOrganizationMembership(organizationId, userId) ⇒ [<code>Promise.&lt;OrganizationMembership&gt;</code>](#OrganizationMembership)

**Kind**: static method of [<code>OrganizationApi</code>](#module_OrganizationApi)  
**Throws**:

- [<code>MembershipNotFound</code>](#MembershipNotFound)

| Param          | Type                |
| -------------- | ------------------- |
| organizationId | <code>number</code> |
| userId         | <code>number</code> |

<a name="module_OrganizationApi.createProOrganizationInvitation"></a>

### OrganizationApi.createProOrganizationInvitation(organizationWithEmail) ⇒ <code>Promise.&lt;void&gt;</code>

**Kind**: static method of [<code>OrganizationApi</code>](#module_OrganizationApi)

| Param                 | Type                |
| --------------------- | ------------------- |
| organizationWithEmail | <code>object</code> |

<a name="module_OrganizationApi..getOrganization"></a>

### OrganizationApi~getOrganization(id) ⇒ <code>Promise.&lt;OrganizationDTO&gt;</code>

**Kind**: inner method of [<code>OrganizationApi</code>](#module_OrganizationApi)  
**Throws**:

- <code>NotFoundError</code> if organization does not exist

| Param | Type                |
| ----- | ------------------- |
| id    | <code>number</code> |

<a name="module_OrganizationApi..OrganizationDTO"></a>

### OrganizationApi~OrganizationDTO : <code>object</code>

**Kind**: inner typedef of [<code>OrganizationApi</code>](#module_OrganizationApi)  
**Properties**

| Name               | Type                 |
| ------------------ | -------------------- |
| id                 | <code>number</code>  |
| name               | <code>string</code>  |
| type               | <code>string</code>  |
| logoUrl            | <code>string</code>  |
| isManagingStudents | <code>boolean</code> |
| identityProvider   | <code>string</code>  |

<a name="module_OrganizationApi..NotFoundError"></a>

### OrganizationApi~NotFoundError : <code>object</code>

**Kind**: inner typedef of [<code>OrganizationApi</code>](#module_OrganizationApi)  
**Properties**

| Name    | Type                |
| ------- | ------------------- |
| message | <code>string</code> |
| code    | <code>string</code> |

<a name="module_UserTeamsApi"></a>

## UserTeamsApi

<a name="module_UserTeamsApi.getUserTeamsInfo"></a>

### UserTeamsApi.getUserTeamsInfo(userId) ⇒ [<code>Promise.&lt;UserTeamsInfo&gt;</code>](#UserTeamsInfo)

Retrieves information user's teams.

**Kind**: static method of [<code>UserTeamsApi</code>](#module_UserTeamsApi)  
**Returns**: [<code>Promise.&lt;UserTeamsInfo&gt;</code>](#UserTeamsInfo) - A promise that resolves to an instance of UserTeamsInfo.  
**Throws**:

- <code>TypeError</code> preconditions failed

| Param  | Type                | Description         |
| ------ | ------------------- | ------------------- |
| userId | <code>string</code> | The ID of the user. |

<a name="FrameworkDTO"></a>

## FrameworkDTO

**Kind**: global class  
<a name="new_FrameworkDTO_new"></a>

### new FrameworkDTO(params)

| Param           | Type                                           |
| --------------- | ---------------------------------------------- |
| params          | <code>object</code>                            |
| params.id       | <code>string</code>                            |
| params.name     | <code>string</code>                            |
| params.areaDTOs | [<code>Array.&lt;AreaDTO&gt;</code>](#AreaDTO) |

<a name="AreaDTO"></a>

## AreaDTO

**Kind**: global class  
<a name="new_AreaDTO_new"></a>

### new AreaDTO(params)

| Param                 | Type                                                       |
| --------------------- | ---------------------------------------------------------- |
| params                | <code>object</code>                                        |
| params.id             | <code>string</code>                                        |
| params.title          | <code>object</code>                                        |
| params.code           | <code>string</code>                                        |
| params.color          | <code>string</code>                                        |
| params.competenceDTOs | [<code>Array.&lt;CompetenceDTO&gt;</code>](#CompetenceDTO) |

<a name="CompetenceDTO"></a>

## CompetenceDTO

**Kind**: global class  
<a name="new_CompetenceDTO_new"></a>

### new CompetenceDTO(params)

| Param               | Type                                                   |
| ------------------- | ------------------------------------------------------ |
| params              | <code>object</code>                                    |
| params.id           | <code>string</code>                                    |
| params.name         | <code>object</code>                                    |
| params.index        | <code>string</code>                                    |
| params.thematicDTOs | [<code>Array.&lt;ThematicDTO&gt;</code>](#ThematicDTO) |

<a name="ThematicDTO"></a>

## ThematicDTO

**Kind**: global class  
<a name="new_ThematicDTO_new"></a>

### new ThematicDTO(params)

| Param           | Type                                           |
| --------------- | ---------------------------------------------- |
| params          | <code>object</code>                            |
| params.id       | <code>string</code>                            |
| params.name     | <code>object</code>                            |
| params.index    | <code>string</code>                            |
| params.tubeDTOs | [<code>Array.&lt;TubeDTO&gt;</code>](#TubeDTO) |

<a name="TubeDTO"></a>

## TubeDTO

**Kind**: global class  
<a name="new_TubeDTO_new"></a>

### new TubeDTO(params)

| Param                 | Type                |
| --------------------- | ------------------- |
| params                | <code>object</code> |
| params.id             | <code>string</code> |
| params.name           | <code>string</code> |
| params.practicalTitle | <code>object</code> |

<a name="AllowedCertificationCenterAccessDTO"></a>

## AllowedCertificationCenterAccessDTO

**Kind**: global class

- [AllowedCertificationCenterAccessDTO](#AllowedCertificationCenterAccessDTO)
  - [.AllowedCertificationCenterAccessDTO](#AllowedCertificationCenterAccessDTO+AllowedCertificationCenterAccessDTO)
    - [new exports.AllowedCertificationCenterAccessDTO(params)](#new_AllowedCertificationCenterAccessDTO+AllowedCertificationCenterAccessDTO_new)

<a name="AllowedCertificationCenterAccessDTO+AllowedCertificationCenterAccessDTO"></a>

### allowedCertificationCenterAccessDTO.AllowedCertificationCenterAccessDTO

**Kind**: instance class of [<code>AllowedCertificationCenterAccessDTO</code>](#AllowedCertificationCenterAccessDTO)  
<a name="new_AllowedCertificationCenterAccessDTO+AllowedCertificationCenterAccessDTO_new"></a>

#### new exports.AllowedCertificationCenterAccessDTO(params)

| Param                                       | Type                                     |
| ------------------------------------------- | ---------------------------------------- |
| params                                      | <code>Object</code>                      |
| params.isAccessBlockedCollege               | <code>boolean</code>                     |
| params.isAccessBlockedLycee                 | <code>boolean</code>                     |
| params.isAccessBlockedAEFE                  | <code>boolean</code>                     |
| params.isAccessBlockedAgri                  | <code>boolean</code>                     |
| params.pixCertifScoBlockedAccessDateCollege | <code>string</code> \| <code>null</code> |
| params.pixCertifScoBlockedAccessDateLycee   | <code>string</code> \| <code>null</code> |

<a name="NetworkOrganizationDTO"></a>

## NetworkOrganizationDTO

**Kind**: global class

- [NetworkOrganizationDTO](#NetworkOrganizationDTO)
  - [.NetworkOrganizationDTO](#NetworkOrganizationDTO+NetworkOrganizationDTO)
    - [new exports.NetworkOrganizationDTO(params)](#new_NetworkOrganizationDTO+NetworkOrganizationDTO_new)

<a name="NetworkOrganizationDTO+NetworkOrganizationDTO"></a>

### networkOrganizationDTO.NetworkOrganizationDTO

**Kind**: instance class of [<code>NetworkOrganizationDTO</code>](#NetworkOrganizationDTO)  
<a name="new_NetworkOrganizationDTO+NetworkOrganizationDTO_new"></a>

#### new exports.NetworkOrganizationDTO(params)

| Param                 | Type                                     |
| --------------------- | ---------------------------------------- |
| params                | <code>Object</code>                      |
| params.organizationId | <code>number</code>                      |
| params.externalId     | <code>string</code> \| <code>null</code> |

<a name="TubeResultLevel"></a>

## TubeResultLevel

**Kind**: global class  
<a name="new_TubeResultLevel_new"></a>

### new TubeResultLevel(props)

| Param                | Type                | Description                                                      |
| -------------------- | ------------------- | ---------------------------------------------------------------- |
| props                | <code>Object</code> |                                                                  |
| props.id             | <code>string</code> |                                                                  |
| props.competenceId   | <code>string</code> | id of the competence the tube belongs to                         |
| props.competenceName | <code>string</code> |                                                                  |
| props.title          | <code>string</code> |                                                                  |
| props.description    | <code>string</code> |                                                                  |
| props.maxLevel       | <code>number</code> | maximum level reachable on the tube                              |
| props.meanLevel      | <code>number</code> | level reached by the participant on the tube, exposed as `level` |

<a name="CompetenceResultLevels"></a>

## CompetenceResultLevels

**Kind**: global class  
<a name="new_CompetenceResultLevels_new"></a>

### new CompetenceResultLevels(props)

| Param                 | Type                              | Description                                        |
| --------------------- | --------------------------------- | -------------------------------------------------- |
| props                 | <code>Object</code>               |                                                    |
| props.id              | <code>string</code>               |                                                    |
| props.index           | <code>string</code>               |                                                    |
| props.name            | <code>string</code>               |                                                    |
| props.description     | <code>string</code>               |                                                    |
| props.maxLevel        | <code>number</code>               | maximum level reachable on the competence          |
| props.meanLevel       | <code>number</code>               | level reached by the participant on the competence |
| [props.levelsPerTube] | <code>Array.&lt;Object&gt;</code> | results of the tubes belonging to the competence   |

<a name="CampaignTubeCoverage"></a>

## CampaignTubeCoverage

**Kind**: global class  
<a name="new_CampaignTubeCoverage_new"></a>

### new CampaignTubeCoverage(args)

| Param | Type                                                               |
| ----- | ------------------------------------------------------------------ |
| args  | [<code>CampaignTubeCoverageArgs</code>](#CampaignTubeCoverageArgs) |

<a name="TubeCoverage"></a>

## TubeCoverage

**Kind**: global class  
<a name="new_TubeCoverage_new"></a>

### new TubeCoverage(args)

| Param | Type                                               |
| ----- | -------------------------------------------------- |
| args  | [<code>TubeCoverageArgs</code>](#TubeCoverageArgs) |

<a name="MembershipNotFound"></a>

## MembershipNotFound

Error representing a missing membership to an organization.

**Kind**: global class  
<a name="hasBeenLearner"></a>

## hasBeenLearner ⇒ <code>Promise.&lt;boolean&gt;</code>

Check if user has been a learner of an organization

**Kind**: global constant  
**Throws**:

- TypeError - Throw when params.userId is not defined

| Param         | Type                | Description                 |
| ------------- | ------------------- | --------------------------- |
| params        | <code>object</code> |                             |
| params.userId | <code>number</code> | The ID of the user to check |

<a name="deleteOrganizationLearnerBeforeImportFeature"></a>

## deleteOrganizationLearnerBeforeImportFeature ⇒ <code>Promise.&lt;void&gt;</code>

delete organization learner before adding import feature

**Kind**: global constant  
**Throws**:

- TypeError - Throw when params.userId or params.organizationId is not defined

| Param                 | Type                | Description                                            |
| --------------------- | ------------------- | ------------------------------------------------------ |
| params                | <code>object</code> |                                                        |
| params.userId         | <code>number</code> | The ID of the user wich request the action             |
| params.organizationId | <code>number</code> | The ID of the organizationId to find learner to delete |

<a name="getByFrameworkAndDate"></a>

## getByFrameworkAndDate(params) ⇒ <code>Promise.&lt;(Version\|null)&gt;</code>

**Kind**: global function

| Param            | Type                    |
| ---------------- | ----------------------- |
| params           | <code>object</code>     |
| params.framework | <code>Frameworks</code> |
| params.date      | <code>Date</code>       |

<a name="getById"></a>

## getById(params) ⇒ <code>Promise.&lt;(Version\|null)&gt;</code>

**Kind**: global function

| Param     | Type                |
| --------- | ------------------- |
| params    | <code>object</code> |
| params.id | <code>number</code> |

<a name="hasBeenCandidate"></a>

## hasBeenCandidate(params) ⇒ <code>Promise.&lt;boolean&gt;</code>

Checks if a user has been candidate to a certification

**Kind**: global function  
**Throws**:

- <code>TypeError</code> preconditions failed

| Param         | Type                | Description                      |
| ------------- | ------------------- | -------------------------------- |
| params        | <code>object</code> |                                  |
| params.userId | <code>number</code> | user id to search for candidates |

<a name="rescoreV3Certification"></a>

## rescoreV3Certification(params) ⇒ <code>Promise.&lt;void&gt;</code>

**Kind**: global function

| Param        | Type                                                                                                                                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| params       | <code>object</code>                                                                                                                                                                                                                                |
| params.event | <code>CertificationJuryDone</code> \| <code>CertificationCourseRejected</code> \| <code>CertificationCourseUnrejected</code> \| <code>CertificationCancelled</code> \| <code>CertificationRescored</code> \| <code>CertificationUncancelled</code> |

<a name="rescoreV2Certification"></a>

## rescoreV2Certification(params) ⇒ <code>Promise.&lt;void&gt;</code>

**Kind**: global function

| Param        | Type                                                                                                                                                                                                                                                                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| params       | <code>object</code>                                                                                                                                                                                                                                                                                                            |
| params.event | <code>ChallengeNeutralized</code> \| <code>ChallengeDeneutralized</code> \| <code>CertificationJuryDone</code> \| <code>CertificationCourseRejected</code> \| <code>CertificationCourseUnrejected</code> \| <code>CertificationCancelled</code> \| <code>CertificationRescored</code> \| <code>CertificationUncancelled</code> |

<a name="selectNextCertificationChallenge"></a>

## selectNextCertificationChallenge(params) ⇒ <code>Promise.&lt;string&gt;</code>

**Kind**: global function  
**Returns**: <code>Promise.&lt;string&gt;</code> - next challenge id  
**Throws**:

- <code>AssessmentEndedError</code> test ended or no next challenge available
- <code>AssessmentLackOfChallengesError</code> no eligible challenges remaining before reaching maximum assessment length

| Param               | Type                |
| ------------------- | ------------------- |
| params              | <code>object</code> |
| params.assessmentId | <code>number</code> |

<a name="getAssessmentLiveAlerts"></a>

## getAssessmentLiveAlerts(params) ⇒ <code>Promise.&lt;{challengeLiveAlerts: Array.&lt;object&gt;, companionLiveAlerts: Array.&lt;object&gt;}&gt;</code>

**Kind**: global function

| Param               | Type                |
| ------------------- | ------------------- |
| params              | <code>object</code> |
| params.assessmentId | <code>number</code> |

<a name="evaluateAndSaveAnswer"></a>

## evaluateAndSaveAnswer(params) ⇒ <code>Promise.&lt;Answer&gt;</code>

**Kind**: global function  
**Returns**: <code>Promise.&lt;Answer&gt;</code> - evaluated answer

| Param                        | Type                 |
| ---------------------------- | -------------------- |
| params                       | <code>object</code>  |
| params.answer                | <code>Answer</code>  |
| params.userId                | <code>number</code>  |
| params.certificationCourseId | <code>number</code>  |
| params.forceOKAnswer         | <code>boolean</code> |

<a name="completeCertificationAssessment"></a>

## completeCertificationAssessment(params) ⇒ <code>Promise.&lt;void&gt;</code>

**Kind**: global function

| Param                        | Type                |
| ---------------------------- | ------------------- |
| params                       | <code>object</code> |
| params.certificationCourseId | <code>number</code> |
| params.locale                | <code>string</code> |

<a name="buildForSession"></a>

## buildForSession(params) ⇒ <code>Promise.&lt;void&gt;</code>

**Kind**: global function

| Param            | Type                |
| ---------------- | ------------------- |
| params           | <code>object</code> |
| params.sessionId | <code>number</code> |

<a name="findByUserIdAndSessionId"></a>

## findByUserIdAndSessionId(params) ⇒ <code>Promise.&lt;(DTOCandidateAuthorization\|null)&gt;</code>

**Kind**: global function

| Param            | Type                |
| ---------------- | ------------------- |
| params           | <code>object</code> |
| params.userId    | <code>number</code> |
| params.sessionId | <code>number</code> |

<a name="onCertificationStartedOrResumed"></a>

## onCertificationStartedOrResumed(params) ⇒ <code>Promise.&lt;void&gt;</code>

**Kind**: global function

| Param                  | Type                | Description                                               |
| ---------------------- | ------------------- | --------------------------------------------------------- |
| params                 | <code>object</code> |                                                           |
| params.certificationId | <code>number</code> |                                                           |
| params.sessionId       | <code>number</code> |                                                           |
| params.timezone        | <code>string</code> | timezone of the candidate starting the certification test |

<a name="findBySessionId"></a>

## findBySessionId(params) ⇒ <code>Promise.&lt;(DTOSessionAuthorization\|null)&gt;</code>

**Kind**: global function

| Param            | Type                |
| ---------------- | ------------------- |
| params           | <code>object</code> |
| params.sessionId | <code>number</code> |

<a name="pushEvents"></a>

## pushEvents(dtoEvents) ⇒ <code>Promise.&lt;void&gt;</code>

**Kind**: global function

| Param     | Type                                             |
| --------- | ------------------------------------------------ |
| dtoEvents | [<code>Array.&lt;DTOEvent&gt;</code>](#DTOEvent) |

<a name="getModulesByIds"></a>

## getModulesByIds(params) ⇒ <code>Array.&lt;Module&gt;</code>

**Kind**: global function

| Param            | Type                              |
| ---------------- | --------------------------------- |
| params           | <code>object</code>               |
| params.moduleIds | <code>Array.&lt;string&gt;</code> |

<a name="get"></a>

## get(challengeId) ⇒ <code>Promise.&lt;ChallengeToPlay&gt;</code>

**Kind**: global function

| Param       | Type                |
| ----------- | ------------------- |
| challengeId | <code>string</code> |

<a name="getSerializationConfig"></a>

## getSerializationConfig() ⇒ <code>Object</code>

**Kind**: global function  
**Returns**: <code>Object</code> - Config for JSON-API serialization of a ChallengeToPlay  
<a name="correctAnswer"></a>

## correctAnswer(params) ⇒ <code>Answer</code>

**Kind**: global function  
**Returns**: <code>Answer</code> - corrected answer

| Param                                  | Type                   | Default            |
| -------------------------------------- | ---------------------- | ------------------ |
| params                                 | <code>Object</code>    |                    |
| params.challenge                       | <code>Challenge</code> |                    |
| params.answer                          | <code>Answer</code>    |                    |
| params.challengeSubmittedAt            | <code>boolean</code>   |                    |
| params.hasChallengeBeenFocusedOut      | <code>boolean</code>   |                    |
| params.isCertificationEvaluation       | <code>boolean</code>   |                    |
| [params.accessibilityAdjustmentNeeded] | <code>boolean</code>   | <code>false</code> |
| [params.forceOKAnswer]                 | <code>boolean</code>   | <code>false</code> |

<a name="findFilteredMostRecentByUser"></a>

## findFilteredMostRecentByUser(payload) ⇒ <code>Promise.&lt;Array.&lt;KnowledgeElementDTO&gt;&gt;</code>

**Kind**: global function

| Param   | Type                             |
| ------- | -------------------------------- |
| payload | [<code>Payload</code>](#Payload) |

<a name="findByIds"></a>

## findByIds()

**Kind**: global function

| Param | Type                |
| ----- | ------------------- |
|       | <code>Object</code> |

<a name="findByTubeIds"></a>

## findByTubeIds(params) ⇒ <code>Promise.&lt;(AllTubesFoundResult\|SomeTubesNotFoundResult\|NoTubesProvidedResult)&gt;</code>

**Kind**: global function

| Param          | Type                              | Description              |
| -------------- | --------------------------------- | ------------------------ |
| params         | <code>Object</code>               |                          |
| params.tubeIds | <code>Array.&lt;string&gt;</code> |                          |
| params.locale  | <code>string</code>               | default to FRENCH_SPOKEN |

**Example**

```js
const { learningContentDTO, error } = await learningContentAPI.findByTubeIds({ tubeIds });
if (error instanceof learningContentAPI.NoTubesProvidedError) {
  throw new MyDomainError(error.message);
}
if (error instanceof learningContentAPI.SomeTubesNotFoundError) {
  logger.error({ missingTubeIds: error.missingTubeIds }, '...');
  // handle the error report in your own way,
  // learningContentDTO.frameworkDTOs will still contain some results
}
for (const frameworkDTO of learningContentDTO.frameworkDTOs) { ... }
```

<a name="findByIds"></a>

## findByIds(params) ⇒ <code>Promise.&lt;Array.&lt;SkillDTO&gt;&gt;</code>

**Kind**: global function

| Param      | Type                              |
| ---------- | --------------------------------- |
| params     | <code>Object</code>               |
| params.ids | <code>Array.&lt;string&gt;</code> |

<a name="acceptLegalDocumentByUserId"></a>

## acceptLegalDocumentByUserId(params) ⇒ <code>Promise.&lt;void&gt;</code>

Accepts a legal document for a user by their ID.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - - A promise that resolves when the legal document is accepted.

| Param          | Type                | Description                                                       |
| -------------- | ------------------- | ----------------------------------------------------------------- |
| params         | <code>Object</code> | The parameters.                                                   |
| params.userId  | <code>string</code> | The ID of the user.                                               |
| params.service | <code>string</code> | The service associated with the legal document. (e.g. 'pix-orga') |
| params.type    | <code>string</code> | The type of the legal document. (e.g. 'TOS')                      |

<a name="getLegalDocumentStatusByUserId"></a>

## getLegalDocumentStatusByUserId(params) ⇒ <code>Promise.&lt;LegalDocumentStatus&gt;</code>

Gets the status of a legal document for a user by their ID.

**Kind**: global function  
**Returns**: <code>Promise.&lt;LegalDocumentStatus&gt;</code> - - A promise that resolves with the status of the legal document.

| Param          | Type                | Description                                                       |
| -------------- | ------------------- | ----------------------------------------------------------------- |
| params         | <code>Object</code> | The parameters.                                                   |
| params.userId  | <code>string</code> | The ID of the user.                                               |
| params.service | <code>string</code> | The service associated with the legal document. (e.g. 'pix-orga') |
| params.type    | <code>string</code> | The type of the legal document. (e.g. 'TOS')                      |

<a name="startChat"></a>

## startChat(params) ⇒ <code>Promise.&lt;LLMChatDTO&gt;</code>

**Kind**: global function

| Param               | Type                                          |
| ------------------- | --------------------------------------------- |
| params              | <code>Object</code>                           |
| params.configId     | <code>string</code>                           |
| params.userId       | <code>string</code>                           |
| params.challengeId  | <code>string</code> \| <code>undefined</code> |
| params.assessmentId | <code>number</code> \| <code>undefined</code> |
| params.moduleId     | <code>string</code> \| <code>undefined</code> |
| params.passageId    | <code>number</code> \| <code>undefined</code> |

<a name="prompt"></a>

## prompt(params) ⇒ <code>Promise.&lt;Readable&gt;</code>

**Kind**: global function

| Param                 | Type                                                               |
| --------------------- | ------------------------------------------------------------------ |
| params                | <code>Object</code>                                                |
| params.chatId         | <code>string</code>                                                |
| params.userId         | <code>string</code>                                                |
| params.message        | <code>string</code> \| <code>null</code> \| <code>undefined</code> |
| params.attachmentName | <code>string</code> \| <code>null</code> \| <code>undefined</code> |

<a name="hasCampaignParticipations"></a>

## hasCampaignParticipations(userId) ⇒ <code>Promise.&lt;boolean&gt;</code>

**Kind**: global function

| Param  | Type                |
| ------ | ------------------- |
| userId | <code>number</code> |

<a name="findByUserId"></a>

## findByUserId(userId) ⇒ <code>Promise.&lt;Array.&lt;{id: number, campaignId: number, targetProfileId: number}&gt;&gt;</code>

**Kind**: global function

| Param  | Type                |
| ------ | ------------------- |
| userId | <code>number</code> |

<a name="getCampaignParticipationResult"></a>

## getCampaignParticipationResult(params) ⇒ <code>Promise.&lt;CampaignParticipationResult&gt;</code>

Returns the mastery rate and reached levels by tube and competence for a shared participation.

**Kind**: global function  
**Throws**:

- <code>UserNotAuthorizedToAccessEntityError</code> when the participation is not shared

| Param                          | Type                | Default                                    |
| ------------------------------ | ------------------- | ------------------------------------------ |
| params                         | <code>Object</code> |                                            |
| params.campaignParticipationId | <code>number</code> |                                            |
| [params.locale]                | <code>string</code> | <code>&quot;&#x27;fr-FR&#x27;&quot;</code> |

<a name="getHighlightedTrainingsForCampaign"></a>

## getHighlightedTrainingsForCampaign(params) ⇒ <code>Promise.&lt;Array.&lt;number&gt;&gt;</code>

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;number&gt;&gt;</code> - List of id of highlighted trainings in engine recommended campaign

| Param  | Type                |
| ------ | ------------------- |
| params | <code>Object</code> |

<a name="canSelfDeleteAccount"></a>

## canSelfDeleteAccount(params) ⇒ <code>Promise.&lt;boolean&gt;</code>

Determines if a user can self-delete their account.

**Kind**: global function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - - A promise that resolves to a boolean indicating if the user can self-delete their account.

| Param         | Type                | Description                      |
| ------------- | ------------------- | -------------------------------- |
| params        | <code>Object</code> | The parameters for the function. |
| params.userId | <code>number</code> | The ID of the user.              |

<a name="archiveCertificationCenterData"></a>

## archiveCertificationCenterData(params)

**Kind**: global function

| Param                        | Type                |
| ---------------------------- | ------------------- |
| params                       | <code>Object</code> |
| params.certificationCenterId | <code>number</code> |
| params.archiveDate           | <code>date</code>   |
| params.archivedBy            | <code>number</code> |

<a name="DTOCandidateAuthorization"></a>

## DTOCandidateAuthorization : <code>Object</code>

**Kind**: global typedef  
**Properties**

| Name                                        | Type                 |
| ------------------------------------------- | -------------------- |
| id                                          | <code>number</code>  |
| accessCode                                  | <code>string</code>  |
| isSessionJoinable                           | <code>boolean</code> |
| userId                                      | <code>number</code>  |
| authorizedToStart                           | <code>boolean</code> |
| certificationId                             | <code>number</code>  |
| reconciledAt                                | <code>Date</code>    |
| subscription                                | <code>string</code>  |
| hasExceededCertificationDuration            | <code>boolean</code> |
| isCenterHabilitatedForCandidateSubscription | <code>boolean</code> |
| centerHabilitations                         | <code>object</code>  |

<a name="DTOSessionAuthorization"></a>

## DTOSessionAuthorization : <code>Object</code>

**Kind**: global typedef  
**Properties**

| Name                                | Type                                     |
| ----------------------------------- | ---------------------------------------- |
| id                                  | <code>number</code>                      |
| sessionStatus                       | <code>SessionStatus</code>               |
| scoIsManagingStudentsOrganizationId | <code>number</code> \| <code>null</code> |
| certificationCenterId               | <code>number</code>                      |
| certificationCenterArchived         | <code>boolean</code>                     |

<a name="DTOEvent"></a>

## DTOEvent : <code>Object</code>

**Kind**: global typedef  
**Properties**

| Name        | Type                |
| ----------- | ------------------- |
| name        | <code>string</code> |
| candidateId | <code>number</code> |
| createdAt   | <code>Date</code>   |
| metadata    | <code>object</code> |

<a name="ModuleStatus"></a>

## ModuleStatus ⇒ [<code>Array.&lt;ModuleStatus&gt;</code>](#ModuleStatus)

**Kind**: global typedef  
**Throws**:

- <code>BadRequestError</code> UserId field is missing

| Param            | Type                              | Description              |
| ---------------- | --------------------------------- | ------------------------ |
| params           | <code>object</code>               |                          |
| params.userId    | <code>number</code>               | mandatory target user id |
| params.moduleIds | <code>Array.&lt;number&gt;</code> | mandatory                |

**Properties**

| Name     | Type                | Description    |
| -------- | ------------------- | -------------- |
| id       | <code>number</code> |                |
| title    | <code>string</code> |                |
| slug     | <code>string</code> |                |
| duration | <code>number</code> |                |
| status   | <code>string</code> | ('not_started' | 'in_progress' | 'completed') |
| shortId  | <code>string</code> |                |

<a name="KnowledgeElementDTO"></a>

## KnowledgeElementDTO : <code>object</code>

**Kind**: global typedef  
**Properties**

| Name    | Type                |
| ------- | ------------------- |
| status  | <code>string</code> |
| skillId | <code>string</code> |

<a name="Payload"></a>

## Payload : <code>object</code>

**Kind**: global typedef  
**Properties**

| Name     | Type                              |
| -------- | --------------------------------- |
| userId   | <code>number</code>               |
| skillIds | <code>Array.&lt;string&gt;</code> |

<a name="NoTubesProvidedResult"></a>

## NoTubesProvidedResult : <code>object</code>

**Kind**: global typedef  
**Properties**

| Name               | Type                              |
| ------------------ | --------------------------------- |
| error              | <code>NoTubesProvidedError</code> |
| learningContentDTO | <code>null</code>                 |

<a name="SomeTubesNotFoundResult"></a>

## SomeTubesNotFoundResult : <code>object</code>

**Kind**: global typedef  
**Properties**

| Name               | Type                                |
| ------------------ | ----------------------------------- |
| error              | <code>SomeTubesNotFoundError</code> |
| learningContentDTO | <code>LearningContentDTO</code>     |

<a name="AllTubesFoundResult"></a>

## AllTubesFoundResult : <code>object</code>

**Kind**: global typedef  
**Properties**

| Name               | Type                            |
| ------------------ | ------------------------------- |
| error              | <code>null</code>               |
| learningContentDTO | <code>LearningContentDTO</code> |

<a name="SkillDTO"></a>

## SkillDTO : <code>object</code>

**Kind**: global typedef  
**Properties**

| Name       | Type                |
| ---------- | ------------------- |
| id         | <code>string</code> |
| difficulty | <code>number</code> |
| tubeId     | <code>string</code> |

<a name="CampaignListItemArgs"></a>

## CampaignListItemArgs : <code>object</code>

**Kind**: global typedef  
**Properties**

| Name              | Type                                                                     |
| ----------------- | ------------------------------------------------------------------------ |
| id                | <code>number</code>                                                      |
| name              | <code>string</code>                                                      |
| createdAt         | <code>Date</code>                                                        |
| archivedAt        | <code>Date</code>                                                        |
| type              | <code>string</code>                                                      |
| code              | <code>string</code>                                                      |
| targetProfileName | <code>string</code>                                                      |
| tubes             | [<code>Array.&lt;CampaignTubeCoverage&gt;</code>](#CampaignTubeCoverage) |

<a name="CampaignTubeCoverageArgs"></a>

## CampaignTubeCoverageArgs : <code>object</code>

**Kind**: global typedef  
**Properties**

| Name                 | Type                |
| -------------------- | ------------------- |
| id                   | <code>string</code> |
| competenceId         | <code>string</code> |
| practicalTitle       | <code>string</code> |
| practicalDescription | <code>string</code> |
| maxLevel             | <code>number</code> |
| reachedLevel         | <code>number</code> |

<a name="CampaignParticipationArgs"></a>

## CampaignParticipationArgs : <code>Object</code>

**Kind**: global typedef  
**Properties**

| Name                    | Type                                     |
| ----------------------- | ---------------------------------------- |
| participantFirstName    | <code>string</code>                      |
| participantLastName     | <code>string</code>                      |
| participantExternalId   | <code>string</code> \| <code>null</code> |
| userId                  | <code>number</code>                      |
| campaignParticipationId | <code>number</code>                      |
| createdAt               | <code>Date</code>                        |
| sharedAt                | <code>Date</code> \| <code>null</code>   |
| status                  | <code>string</code>                      |

<a name="AssessmentCampaignParticipationArgs"></a>

## AssessmentCampaignParticipationArgs : <code>object</code>

**Kind**: global typedef  
**Extends**: [<code>CampaignParticipationArgs</code>](#CampaignParticipationArgs)  
**Properties**

| Name        | Type                                                     |
| ----------- | -------------------------------------------------------- |
| masteryRate | <code>number</code>                                      |
| tubes       | [<code>Array.&lt;TubeCoverage&gt;</code>](#TubeCoverage) |

<a name="ProfilesCollectionCampaignParticipationArgs"></a>

## ProfilesCollectionCampaignParticipationArgs : <code>object</code>

**Kind**: global typedef  
**Extends**: [<code>CampaignParticipationArgs</code>](#CampaignParticipationArgs)  
**Properties**

| Name     | Type                |
| -------- | ------------------- |
| pixScore | <code>number</code> |

<a name="TubeCoverageArgs"></a>

## TubeCoverageArgs : <code>Object</code>

**Kind**: global typedef  
**Properties**

| Name            | Type                |
| --------------- | ------------------- |
| id              | <code>string</code> |
| competenceId    | <code>string</code> |
| competenceName  | <code>string</code> |
| competenceIndex | <code>string</code> |
| areaName        | <code>string</code> |
| title           | <code>string</code> |
| description     | <code>string</code> |
| maxLevel        | <code>number</code> |
| reachedLevel    | <code>number</code> |

<a name="CombinedCourseArgs"></a>

## CombinedCourseArgs : <code>object</code>

**Kind**: global typedef  
**Properties**

| Name | Type                |
| ---- | ------------------- |
| id   | <code>number</code> |
| name | <code>string</code> |
