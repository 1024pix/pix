This doc has been generated on 28/04/2026 14:14:23 with `scripts/generate-api-documentation.js`. See package.json.

---
## Modules

<dl>
<dt><a href="#module_CampaignApi">CampaignApi</a></dt>
<dd></dd>
<dt><a href="#module_OrganizationLearnerApi">OrganizationLearnerApi</a></dt>
<dd></dd>
<dt><a href="#module_TargetProfileApi">TargetProfileApi</a></dt>
<dd></dd>
</dl>

## Classes

<dl>
<dt><a href="#CampaignParticipation">CampaignParticipation</a></dt>
<dd></dd>
<dt><a href="#AssessmentCampaignParticipation">AssessmentCampaignParticipation</a></dt>
<dd></dd>
<dt><a href="#ProfilesCollectionCampaignParticipation">ProfilesCollectionCampaignParticipation</a></dt>
<dd></dd>
<dt><a href="#TubeCoverage">TubeCoverage</a></dt>
<dd></dd>
</dl>

## Constants

<dl>
<dt><a href="#hasBeenLearner">hasBeenLearner</a> ⇒ <code>Promise.&lt;boolean&gt;</code></dt>
<dd><p>Check if user has been a learner of an organization</p>
</dd>
<dt><a href="#deleteOrganizationLearnerBeforeImportFeature">deleteOrganizationLearnerBeforeImportFeature</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>delete organization learner before adding import feature</p>
</dd>
<dt><a href="#anonymizeByUserId">anonymizeByUserId</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Anonymize an organizationLearner and their campaignParticipations</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#hasCampaignParticipations">hasCampaignParticipations(userId)</a> ⇒ <code>Promise.&lt;boolean&gt;</code></dt>
<dd></dd>
<dt><a href="#findByUserId">findByUserId(userId)</a> ⇒ <code>Promise.&lt;Array.&lt;{id: number, campaignId: number, targetProfileId: number}&gt;&gt;</code></dt>
<dd></dd>
<dt><a href="#findByOrganizationLearnerIds">findByOrganizationLearnerIds(organizationLearnerIds)</a> ⇒ <code>Promise.&lt;Array.&lt;CampaignParticipation&gt;&gt;</code></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
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
</dl>

<a name="module_CampaignApi"></a>

## CampaignApi

* [CampaignApi](#module_CampaignApi)
    * [~save(campaigns, options)](#module_CampaignApi..save) ⇒ <code>Promise.&lt;(SavedCampaign\|Array.&lt;CampaignPayload&gt;)&gt;</code>
    * [~get(campaignId)](#module_CampaignApi..get) ⇒ <code>Promise.&lt;Campaign&gt;</code>
    * [~getByCampaignParticipationId(campaignParticipationId)](#module_CampaignApi..getByCampaignParticipationId) ⇒ <code>Promise.&lt;(Campaign\|null)&gt;</code>
    * [~getByCode(code, string)](#module_CampaignApi..getByCode) ⇒ <code>Promise.&lt;Campaign&gt;</code>
    * [~update(payload)](#module_CampaignApi..update) ⇒ <code>Promise.&lt;Campaign&gt;</code>
    * [~findAllForOrganization(payload)](#module_CampaignApi..findAllForOrganization) ⇒ <code>Promise.&lt;CampaignListResponse&gt;</code>
    * [~findCampaignSkillIdsForCampaignParticipations(campaignParticipationIds)](#module_CampaignApi..findCampaignSkillIdsForCampaignParticipations) ⇒ <code>Promise.&lt;Array.&lt;Number&gt;&gt;</code>
    * [~getCampaignParticipations(payload)](#module_CampaignApi..getCampaignParticipations) ⇒ <code>Promise.&lt;{models: (Array.&lt;AssessmentCampaignParticipationAPI&gt;\|Array.&lt;ProfilesCollectionCampaignParticipationAPI&gt;), meta: Pagination}&gt;</code>
    * [~deleteActiveCampaigns(payload)](#module_CampaignApi..deleteActiveCampaigns) ⇒ <code>Promise.&lt;void&gt;</code>
    * [~CampaignPayload](#module_CampaignApi..CampaignPayload) : <code>object</code>
    * [~UserNotAuthorizedToCreateCampaignError](#module_CampaignApi..UserNotAuthorizedToCreateCampaignError) : <code>object</code>
    * [~CampaignCreationOptions](#module_CampaignApi..CampaignCreationOptions) : <code>object</code>
    * [~UpdateCampaignPayload](#module_CampaignApi..UpdateCampaignPayload) : <code>object</code>
    * [~PageDefinition](#module_CampaignApi..PageDefinition) : <code>object</code>
    * [~CampaignListPayload](#module_CampaignApi..CampaignListPayload) : <code>object</code>
    * [~Pagination](#module_CampaignApi..Pagination) : <code>object</code>
    * [~CampaignListResponse](#module_CampaignApi..CampaignListResponse) : <code>object</code>
    * [~CampaignParticipationsPayload](#module_CampaignApi..CampaignParticipationsPayload) : <code>object</code>
    * [~DeleteActiveCampaignPayload](#module_CampaignApi..DeleteActiveCampaignPayload) : <code>object</code>

<a name="module_CampaignApi..save"></a>

### CampaignApi~save(campaigns, options) ⇒ <code>Promise.&lt;(SavedCampaign\|Array.&lt;CampaignPayload&gt;)&gt;</code>
**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)  
**Throws**:

- <code>UserNotAuthorizedToCreateCampaignError</code> to be improved to handle different error types


| Param | Type |
| --- | --- |
| campaigns | <code>CampaignPayload</code> \| <code>Array.&lt;CampaignPayload&gt;</code> | 
| options | <code>CampaignCreationOptions</code> | 

<a name="module_CampaignApi..get"></a>

### CampaignApi~get(campaignId) ⇒ <code>Promise.&lt;Campaign&gt;</code>
**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)  

| Param | Type |
| --- | --- |
| campaignId | <code>number</code> | 

<a name="module_CampaignApi..getByCampaignParticipationId"></a>

### CampaignApi~getByCampaignParticipationId(campaignParticipationId) ⇒ <code>Promise.&lt;(Campaign\|null)&gt;</code>
**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)  

| Param | Type |
| --- | --- |
| campaignParticipationId | <code>number</code> | 

<a name="module_CampaignApi..getByCode"></a>

### CampaignApi~getByCode(code, string) ⇒ <code>Promise.&lt;Campaign&gt;</code>
**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)  

| Param | Type |
| --- | --- |
| code | <code>number</code> | 
| string | <code>locale</code> | 

<a name="module_CampaignApi..update"></a>

### CampaignApi~update(payload) ⇒ <code>Promise.&lt;Campaign&gt;</code>
**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)  

| Param | Type |
| --- | --- |
| payload | <code>UpdateCampaignPayload</code> | 

<a name="module_CampaignApi..findAllForOrganization"></a>

### CampaignApi~findAllForOrganization(payload) ⇒ <code>Promise.&lt;CampaignListResponse&gt;</code>
**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)  

| Param | Type |
| --- | --- |
| payload | <code>CampaignListPayload</code> | 

<a name="module_CampaignApi..findCampaignSkillIdsForCampaignParticipations"></a>

### CampaignApi~findCampaignSkillIdsForCampaignParticipations(campaignParticipationIds) ⇒ <code>Promise.&lt;Array.&lt;Number&gt;&gt;</code>
**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)  

| Param | Type |
| --- | --- |
| campaignParticipationIds | <code>Array.&lt;Number&gt;</code> | 

<a name="module_CampaignApi..getCampaignParticipations"></a>

### CampaignApi~getCampaignParticipations(payload) ⇒ <code>Promise.&lt;{models: (Array.&lt;AssessmentCampaignParticipationAPI&gt;\|Array.&lt;ProfilesCollectionCampaignParticipationAPI&gt;), meta: Pagination}&gt;</code>
**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)  

| Param | Type |
| --- | --- |
| payload | <code>CampaignParticipationsPayload</code> | 

<a name="module_CampaignApi..deleteActiveCampaigns"></a>

### CampaignApi~deleteActiveCampaigns(payload) ⇒ <code>Promise.&lt;void&gt;</code>
**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)  

| Param | Type |
| --- | --- |
| payload | <code>DeleteActiveCampaignPayload</code> | 

<a name="module_CampaignApi..CampaignPayload"></a>

### CampaignApi~CampaignPayload : <code>object</code>
**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name | Type |
| --- | --- |
| name | <code>string</code> | 
| title | <code>string</code> | 
| targetProfileId | <code>number</code> | 
| organizationId | <code>number</code> | 
| creatorId | <code>number</code> | 
| customLandingPageText | <code>string</code> | 

<a name="module_CampaignApi..UserNotAuthorizedToCreateCampaignError"></a>

### CampaignApi~UserNotAuthorizedToCreateCampaignError : <code>object</code>
**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name | Type |
| --- | --- |
| message | <code>string</code> | 

<a name="module_CampaignApi..CampaignCreationOptions"></a>

### CampaignApi~CampaignCreationOptions : <code>object</code>
**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name | Type |
| --- | --- |
| allowCreationWithoutTargetProfileShare | <code>boolean</code> | 

<a name="module_CampaignApi..UpdateCampaignPayload"></a>

### CampaignApi~UpdateCampaignPayload : <code>object</code>
**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name | Type |
| --- | --- |
| campaignId | <code>number</code> | 
| name | <code>string</code> | 
| title | <code>string</code> | 
| customLandingPageText | <code>string</code> | 

<a name="module_CampaignApi..PageDefinition"></a>

### CampaignApi~PageDefinition : <code>object</code>
**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name | Type |
| --- | --- |
| size | <code>number</code> | 
| number | <code>Page</code> | 

<a name="module_CampaignApi..CampaignListPayload"></a>

### CampaignApi~CampaignListPayload : <code>object</code>
**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name | Type |
| --- | --- |
| organizationId | <code>number</code> | 
| page | <code>PageDefinition</code> | 
| withCoverRate | <code>boolean</code> | 

<a name="module_CampaignApi..Pagination"></a>

### CampaignApi~Pagination : <code>object</code>
**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name | Type |
| --- | --- |
| page | <code>number</code> | 
| pageSize | <code>number</code> | 
| rowCount | <code>number</code> | 
| pageCount | <code>number</code> | 

<a name="module_CampaignApi..CampaignListResponse"></a>

### CampaignApi~CampaignListResponse : <code>object</code>
**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name | Type |
| --- | --- |
| models | <code>Array.&lt;CampaignListItem&gt;</code> | 
| meta | <code>Pagination</code> | 

<a name="module_CampaignApi..CampaignParticipationsPayload"></a>

### CampaignApi~CampaignParticipationsPayload : <code>object</code>
**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name | Type |
| --- | --- |
| campaignId | <code>number</code> | 
| since | <code>string</code> | 
| page | <code>PageDefinition</code> | 

<a name="module_CampaignApi..DeleteActiveCampaignPayload"></a>

### CampaignApi~DeleteActiveCampaignPayload : <code>object</code>
**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name | Type |
| --- | --- |
| organizationId | <code>number</code> | 
| campaignIds | <code>Array.&lt;number&gt;</code> | 
| userId | <code>number</code> | 
| page | <code>PageDefinition</code> | 

<a name="module_OrganizationLearnerApi"></a>

## OrganizationLearnerApi

* [OrganizationLearnerApi](#module_OrganizationLearnerApi)
    * [~find(payload)](#module_OrganizationLearnerApi..find) ⇒ <code>Promise.&lt;OrganizationLearnerListResponse&gt;</code>
    * [~get(organizationLearnerId)](#module_OrganizationLearnerApi..get) ⇒ <code>Promise.&lt;OrganizationLearner&gt;</code>
    * [~findByUserId(userId)](#module_OrganizationLearnerApi..findByUserId) ⇒ <code>Promise.&lt;Array.&lt;OrganizationLearner&gt;&gt;</code>
    * [~findWithOrganizationByUserId(userId)](#module_OrganizationLearnerApi..findWithOrganizationByUserId) ⇒ <code>Promise.&lt;Array.&lt;OrganizationLearnerWithOrganization&gt;&gt;</code>
    * [~findWithOrganizationByIds(organizationLearnerIds, organizationId)](#module_OrganizationLearnerApi..findWithOrganizationByIds) ⇒ <code>Promise.&lt;Array.&lt;OrganizationLearnerWithOrganization&gt;&gt;</code>
    * [~PageDefinition](#module_OrganizationLearnerApi..PageDefinition) : <code>object</code>
    * [~FilterDefinition](#module_OrganizationLearnerApi..FilterDefinition) : <code>object</code>
    * [~OrganizationLearnerListPayload](#module_OrganizationLearnerApi..OrganizationLearnerListPayload) : <code>object</code>
    * [~Pagination](#module_OrganizationLearnerApi..Pagination) : <code>object</code>
    * [~OrganizationLearner](#module_OrganizationLearnerApi..OrganizationLearner) : <code>object</code>
    * [~OrganizationLearnerListResponse](#module_OrganizationLearnerApi..OrganizationLearnerListResponse) : <code>object</code>

<a name="module_OrganizationLearnerApi..find"></a>

### OrganizationLearnerApi~find(payload) ⇒ <code>Promise.&lt;OrganizationLearnerListResponse&gt;</code>
Récupère les organization-learners pour une organization. Par défaut, ces organizations-learners sont triés par prénom puis par nom.
Si le params 'page' est présent, les organization-learners seront paginés
Si le params 'filter' est présent, les organization-learners seront filtrés

**Kind**: inner method of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  

| Param | Type |
| --- | --- |
| payload | <code>OrganizationLearnerListPayload</code> | 

<a name="module_OrganizationLearnerApi..get"></a>

### OrganizationLearnerApi~get(organizationLearnerId) ⇒ <code>Promise.&lt;OrganizationLearner&gt;</code>
**Kind**: inner method of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  

| Param | Type |
| --- | --- |
| organizationLearnerId | <code>number</code> | 

<a name="module_OrganizationLearnerApi..findByUserId"></a>

### OrganizationLearnerApi~findByUserId(userId) ⇒ <code>Promise.&lt;Array.&lt;OrganizationLearner&gt;&gt;</code>
return organization learners link to a given userId

**Kind**: inner method of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  

| Param | Type |
| --- | --- |
| userId | <code>number</code> | 

<a name="module_OrganizationLearnerApi..findWithOrganizationByUserId"></a>

### OrganizationLearnerApi~findWithOrganizationByUserId(userId) ⇒ <code>Promise.&lt;Array.&lt;OrganizationLearnerWithOrganization&gt;&gt;</code>
Return organization learners with their organization linked to a given userId

**Kind**: inner method of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  

| Param | Type |
| --- | --- |
| userId | <code>number</code> | 

<a name="module_OrganizationLearnerApi..findWithOrganizationByIds"></a>

### OrganizationLearnerApi~findWithOrganizationByIds(organizationLearnerIds, organizationId) ⇒ <code>Promise.&lt;Array.&lt;OrganizationLearnerWithOrganization&gt;&gt;</code>
Return organization learners with their organization for a given list of ids and organizationId

**Kind**: inner method of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  

| Param | Type |
| --- | --- |
| organizationLearnerIds | <code>Array.&lt;number&gt;</code> | 
| organizationId | <code>number</code> | 

<a name="module_OrganizationLearnerApi..PageDefinition"></a>

### OrganizationLearnerApi~PageDefinition : <code>object</code>
**Kind**: inner typedef of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  
**Properties**

| Name | Type |
| --- | --- |
| size | <code>number</code> | 
| number | <code>Page</code> | 

<a name="module_OrganizationLearnerApi..FilterDefinition"></a>

### OrganizationLearnerApi~FilterDefinition : <code>object</code>
**Kind**: inner typedef of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  
**Properties**

| Name | Type |
| --- | --- |
| divisions | <code>Array.&lt;string&gt;</code> | 
| name | <code>string</code> | 

<a name="module_OrganizationLearnerApi..OrganizationLearnerListPayload"></a>

### OrganizationLearnerApi~OrganizationLearnerListPayload : <code>object</code>
**Kind**: inner typedef of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  
**Propery**: <code>(FilterDefinition\|undefined)</code> filter  
**Properties**

| Name | Type |
| --- | --- |
| organizationId | <code>number</code> | 
| page | <code>PageDefinition</code> \| <code>undefined</code> | 

<a name="module_OrganizationLearnerApi..Pagination"></a>

### OrganizationLearnerApi~Pagination : <code>object</code>
**Kind**: inner typedef of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  
**Properties**

| Name | Type |
| --- | --- |
| page | <code>number</code> | 
| pageSize | <code>number</code> | 
| rowCount | <code>number</code> | 
| pageCount | <code>number</code> | 

<a name="module_OrganizationLearnerApi..OrganizationLearner"></a>

### OrganizationLearnerApi~OrganizationLearner : <code>object</code>
**Kind**: inner typedef of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  
**Properties**

| Name | Type |
| --- | --- |
| id | <code>number</code> | 
| firstName | <code>string</code> | 
| lastName | <code>string</code> | 
| division | <code>string</code> | 
| organizationId | <code>number</code> | 

<a name="module_OrganizationLearnerApi..OrganizationLearnerListResponse"></a>

### OrganizationLearnerApi~OrganizationLearnerListResponse : <code>object</code>
**Kind**: inner typedef of [<code>OrganizationLearnerApi</code>](#module_OrganizationLearnerApi)  
**Properties**

| Name | Type |
| --- | --- |
| organizationLearners | <code>Array.&lt;OrganizationLearner&gt;</code> | 
| pagination | <code>Pagination</code> \| <code>undefined</code> | 

<a name="module_TargetProfileApi"></a>

## TargetProfileApi

* [TargetProfileApi](#module_TargetProfileApi)
    * [~getByOrganizationId(organizationId)](#module_TargetProfileApi..getByOrganizationId) ⇒ <code>Promise.&lt;Array.&lt;TargetProfile&gt;&gt;</code>
    * [~getByIdForAdmin(id)](#module_TargetProfileApi..getByIdForAdmin) ⇒ <code>Promise.&lt;TargetProfile&gt;</code>
    * [~getById(id)](#module_TargetProfileApi..getById) ⇒ <code>Promise.&lt;TargetProfile&gt;</code>
    * [~findSkillByTargetProfileIds(targetProfilsIds)](#module_TargetProfileApi..findSkillByTargetProfileIds) ⇒ <code>Promise.&lt;Array.&lt;TargetProfileSkill&gt;&gt;</code>

<a name="module_TargetProfileApi..getByOrganizationId"></a>

### TargetProfileApi~getByOrganizationId(organizationId) ⇒ <code>Promise.&lt;Array.&lt;TargetProfile&gt;&gt;</code>
**Kind**: inner method of [<code>TargetProfileApi</code>](#module_TargetProfileApi)  

| Param | Type |
| --- | --- |
| organizationId | <code>number</code> | 

<a name="module_TargetProfileApi..getByIdForAdmin"></a>

### TargetProfileApi~getByIdForAdmin(id) ⇒ <code>Promise.&lt;TargetProfile&gt;</code>
**Kind**: inner method of [<code>TargetProfileApi</code>](#module_TargetProfileApi)  

| Param | Type |
| --- | --- |
| id | <code>number</code> | 

<a name="module_TargetProfileApi..getById"></a>

### TargetProfileApi~getById(id) ⇒ <code>Promise.&lt;TargetProfile&gt;</code>
**Kind**: inner method of [<code>TargetProfileApi</code>](#module_TargetProfileApi)  

| Param | Type |
| --- | --- |
| id | <code>number</code> | 

<a name="module_TargetProfileApi..findSkillByTargetProfileIds"></a>

### TargetProfileApi~findSkillByTargetProfileIds(targetProfilsIds) ⇒ <code>Promise.&lt;Array.&lt;TargetProfileSkill&gt;&gt;</code>
**Kind**: inner method of [<code>TargetProfileApi</code>](#module_TargetProfileApi)  

| Param | Type |
| --- | --- |
| targetProfilsIds | <code>Array.&lt;number&gt;</code> | 

<a name="CampaignParticipation"></a>

## CampaignParticipation
**Kind**: global class  
<a name="new_CampaignParticipation_new"></a>

### new CampaignParticipation(args)

| Param | Type |
| --- | --- |
| args | [<code>CampaignParticipationArgs</code>](#CampaignParticipationArgs) | 

<a name="AssessmentCampaignParticipation"></a>

## AssessmentCampaignParticipation
**Kind**: global class  
<a name="new_AssessmentCampaignParticipation_new"></a>

### new AssessmentCampaignParticipation(args)

| Param | Type |
| --- | --- |
| args | [<code>AssessmentCampaignParticipationArgs</code>](#AssessmentCampaignParticipationArgs) | 

<a name="ProfilesCollectionCampaignParticipation"></a>

## ProfilesCollectionCampaignParticipation
**Kind**: global class  
<a name="new_ProfilesCollectionCampaignParticipation_new"></a>

### new ProfilesCollectionCampaignParticipation(args)

| Param | Type |
| --- | --- |
| args | [<code>ProfilesCollectionCampaignParticipationArgs</code>](#ProfilesCollectionCampaignParticipationArgs) | 

<a name="TubeCoverage"></a>

## TubeCoverage
**Kind**: global class  
<a name="new_TubeCoverage_new"></a>

### new TubeCoverage(args)

| Param | Type |
| --- | --- |
| args | [<code>TubeCoverageArgs</code>](#TubeCoverageArgs) | 

<a name="hasBeenLearner"></a>

## hasBeenLearner ⇒ <code>Promise.&lt;boolean&gt;</code>
Check if user has been a learner of an organization

**Kind**: global constant  
**Throws**:

- TypeError - Throw when params.userId is not defined


| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> |  |
| params.userId | <code>number</code> | The ID of the user to check |

<a name="deleteOrganizationLearnerBeforeImportFeature"></a>

## deleteOrganizationLearnerBeforeImportFeature ⇒ <code>Promise.&lt;void&gt;</code>
delete organization learner before adding import feature

**Kind**: global constant  
**Throws**:

- TypeError - Throw when params.userId or params.organizationId is not defined


| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> |  |
| params.userId | <code>number</code> | The ID of the user wich request the action |
| params.organizationId | <code>number</code> | The ID of the organizationId to find learner to delete |

<a name="anonymizeByUserId"></a>

## anonymizeByUserId ⇒ <code>Promise.&lt;void&gt;</code>
Anonymize an organizationLearner and their campaignParticipations

**Kind**: global constant  

| Param | Type |
| --- | --- |
| params | <code>object</code> | 
| params.userId | <code>number</code> | 

<a name="hasCampaignParticipations"></a>

## hasCampaignParticipations(userId) ⇒ <code>Promise.&lt;boolean&gt;</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| userId | <code>number</code> | 

<a name="findByUserId"></a>

## findByUserId(userId) ⇒ <code>Promise.&lt;Array.&lt;{id: number, campaignId: number, targetProfileId: number}&gt;&gt;</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| userId | <code>number</code> | 

<a name="findByOrganizationLearnerIds"></a>

## findByOrganizationLearnerIds(organizationLearnerIds) ⇒ <code>Promise.&lt;Array.&lt;CampaignParticipation&gt;&gt;</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| organizationLearnerIds | <code>Array.&lt;number&gt;</code> | 

<a name="CampaignListItemArgs"></a>

## CampaignListItemArgs : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| id | <code>number</code> | 
| name | <code>string</code> | 
| createdAt | <code>Date</code> | 
| archivedAt | <code>Date</code> | 
| type | <code>string</code> | 
| code | <code>string</code> | 
| targetProfileName | <code>string</code> | 
| tubes | <code>Array.&lt;CampaignTubeCoverage&gt;</code> | 

<a name="CampaignTubeCoverageArgs"></a>

## CampaignTubeCoverageArgs : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| id | <code>string</code> | 
| competenceId | <code>string</code> | 
| practicalTitle | <code>string</code> | 
| practicalDescription | <code>string</code> | 
| maxLevel | <code>number</code> | 
| reachedLevel | <code>number</code> | 

<a name="CampaignParticipationArgs"></a>

## CampaignParticipationArgs : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| participantFirstName | <code>string</code> | 
| participantLastName | <code>string</code> | 
| participantExternalId | <code>string</code> \| <code>null</code> | 
| userId | <code>number</code> | 
| campaignParticipationId | <code>number</code> | 
| createdAt | <code>Date</code> | 
| sharedAt | <code>Date</code> \| <code>null</code> | 
| status | <code>string</code> | 

<a name="AssessmentCampaignParticipationArgs"></a>

## AssessmentCampaignParticipationArgs : <code>object</code>
**Kind**: global typedef  
**Extends**: [<code>CampaignParticipationArgs</code>](#CampaignParticipationArgs)  
**Properties**

| Name | Type |
| --- | --- |
| masteryRate | <code>number</code> | 
| tubes | [<code>Array.&lt;TubeCoverage&gt;</code>](#TubeCoverage) | 

<a name="ProfilesCollectionCampaignParticipationArgs"></a>

## ProfilesCollectionCampaignParticipationArgs : <code>object</code>
**Kind**: global typedef  
**Extends**: [<code>CampaignParticipationArgs</code>](#CampaignParticipationArgs)  
**Properties**

| Name | Type |
| --- | --- |
| pixScore | <code>number</code> | 

<a name="TubeCoverageArgs"></a>

## TubeCoverageArgs : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type |
| --- | --- |
| id | <code>string</code> | 
| competenceId | <code>string</code> | 
| title | <code>string</code> | 
| description | <code>string</code> | 
| maxLevel | <code>number</code> | 
| reachedLevel | <code>number</code> | 


