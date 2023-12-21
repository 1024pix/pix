## Modules

<dl>
<dt><a href="#module_CampaignApi">CampaignApi</a></dt>
<dd></dd>
<dt><a href="#module_TargetProfileApi">TargetProfileApi</a></dt>
<dd></dd>
</dl>

<a name="module_CampaignApi"></a>

## CampaignApi

* [CampaignApi](#module_CampaignApi)
    * [~save(campaign)](#module_CampaignApi..save) ⇒ <code>Promise.&lt;SavedCampaign&gt;</code>
    * [~get(campaignId)](#module_CampaignApi..get) ⇒ <code>Promise.&lt;Campaign&gt;</code>
    * [~update(payload)](#module_CampaignApi..update) ⇒ <code>Promise.&lt;Campaign&gt;</code>
    * [~findAllForOrganization(payload)](#module_CampaignApi..findAllForOrganization) ⇒ <code>Promise.&lt;CampaignListResponse&gt;</code>
    * [~CampaignPayload](#module_CampaignApi..CampaignPayload) : <code>object</code>
    * [~UserNotAuthorizedToCreateCampaignError](#module_CampaignApi..UserNotAuthorizedToCreateCampaignError) : <code>object</code>
    * [~UpdateCampaignPayload](#module_CampaignApi..UpdateCampaignPayload) : <code>object</code>
    * [~PageDefinition](#module_CampaignApi..PageDefinition) : <code>object</code>
    * [~CampaignListPayload](#module_CampaignApi..CampaignListPayload) : <code>object</code>
    * [~Pagination](#module_CampaignApi..Pagination) : <code>object</code>
    * [~CampaignListResponse](#module_CampaignApi..CampaignListResponse) : <code>object</code>

<a name="module_CampaignApi..save"></a>

### CampaignApi~save(campaign) ⇒ <code>Promise.&lt;SavedCampaign&gt;</code>
**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)  
**Throws**:

- <code>UserNotAuthorizedToCreateCampaignError</code> to be improved to handle different error types


| Param | Type |
| --- | --- |
| campaign | <code>CampaignPayload</code> | 

<a name="module_CampaignApi..get"></a>

### CampaignApi~get(campaignId) ⇒ <code>Promise.&lt;Campaign&gt;</code>
**Kind**: inner method of [<code>CampaignApi</code>](#module_CampaignApi)  

| Param | Type |
| --- | --- |
| campaignId | <code>number</code> | 

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

<a name="module_CampaignApi..UpdateCampaignPayload"></a>

### CampaignApi~UpdateCampaignPayload : <code>object</code>
**Kind**: inner typedef of [<code>CampaignApi</code>](#module_CampaignApi)  
**Properties**

| Name | Type |
| --- | --- |
| campaignId | <code>number</code> | 
| name | <code>string</code> | 

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

<a name="module_TargetProfileApi"></a>

## TargetProfileApi

* [TargetProfileApi](#module_TargetProfileApi)
    * [~getByOrganizationId(organizationId)](#module_TargetProfileApi..getByOrganizationId) ⇒ <code>Promise.&lt;Array.&lt;TargetProfile&gt;&gt;</code>
    * [~getById(id)](#module_TargetProfileApi..getById) ⇒ <code>Promise.&lt;TargetProfile&gt;</code>

<a name="module_TargetProfileApi..getByOrganizationId"></a>

### TargetProfileApi~getByOrganizationId(organizationId) ⇒ <code>Promise.&lt;Array.&lt;TargetProfile&gt;&gt;</code>
**Kind**: inner method of [<code>TargetProfileApi</code>](#module_TargetProfileApi)  

| Param | Type |
| --- | --- |
| organizationId | <code>number</code> | 

<a name="module_TargetProfileApi..getById"></a>

### TargetProfileApi~getById(id) ⇒ <code>Promise.&lt;TargetProfile&gt;</code>
**Kind**: inner method of [<code>TargetProfileApi</code>](#module_TargetProfileApi)  

| Param | Type |
| --- | --- |
| id | <code>number</code> | 


