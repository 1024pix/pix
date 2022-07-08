# 1. Gestion des tâches asynchrones avec PgBoss

Date : 2022-02-24

## État

En cours

## Contexte

L'utilisation des évènements dans l'application a mis en évidence des problématiques de cohérences des données que nous
ne gérons pas pour le moment. Quand un évènement est lancé après l'exécution d'un use case et que l'application plante,
les traitements liés à la gestion de l'évènement ne sont pas forcément exécutés.
Par exemple après le partage des résultats d'une participation à une campagne nous utilisons un évènement pour
déclencher le calcul du snapshot des résultats. En cas de problème, la participation est partagée, mais on peut ne
pas avoir de snapshot.

C'est une situation qui s'est produite lorsque Scalingo a fait de la maintenance sur les bases de données.

### Solution : PgBoss

PgBoss est une job queue qui est persisté dans une base PostgreSQL.

![job-states](../assets/job-states.png)

La solution s'oriente vers PgBoss parce que la queue est dans un base PG, tout comme le reste de nos données.
On peut envisager d'ajouter un job en BDD et de faire les traitements d'un use case dans une même transaction. Ce qui
permet de ne pas perdre le traitement d'un évènement en cas d'erreur. 

#### 1. Les migrations PgBoss

Les migrations PgBoss sont jouées quand on appelle la fonction [pgBoss.start()](https://github.com/timgit/pg-boss/blob/master/docs/readme.md#start).

Ces migrations peuvent prendre du temps s'il existe beaucoup de jobs dans la BDD. Pour pouvoir jouer ces
migrations sans introduire ce problème il faut ajouter au script db:migrate l'appel à la fonction start de PgBoss.

```js
// api/package.json
"db:migrate": "knex --knexfile db/knexfile.js migrate:latest && node scripts/database/run-pg-boss-migration.js",
  
require('dotenv').config();
const PgBoss = require('pg-boss');

async function main() {
  console.log(process.env);
  const databaseUrl = process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
  const boss = new PgBoss(databaseUrl);
  await boss.start();
  await boss.stop();
}

```

Le but c'est de ne pas avoir à faire le pgBoss.start à chaque fois qu'on lance PgBoss et de prendre le risque que le
start prenne du temps à cause de migrations. Si jamais un start est fait dans un conteneur web on peut bloquer un worker
le temps de faire les migrations PgBoss.

#### 2. Ajouter un job

Dans le conteneur web le contrôleur utilisera les évènements pour créer des jobs. On doit créer une classe / service qui
sera instancié (en prenant la transaction knex en paramètre) dans l' EventDispatcher. Ensuite, l'EventDispatcher passera
cette classe / service au handler qui l'utilisera pour ajouter un job.

La classe / service fera une requête en BDD pour ajouter une ligne dans la table `job` du schéma de PgBoss en spécifiant
le nom (name), paramètres (data) et les informations pour configurer le job.

> ##### Job table
>
> The following command is the definition of the primary job table. For manual job creation, the only required column is name. All other columns are nullable or have sensible defaults.
>
>  ```sql
>  CREATE TABLE ${schema}.job (
>     id uuid primary key not null default gen_random_uuid(),
>     name text not null,
>     priority integer not null default(0),
>     data jsonb,
>     state ${schema}.job_state not null default('${states.created}'),
>     retryLimit integer not null default(0),
>     retryCount integer not null default(0),
>     retryDelay integer not null default(0),
>     retryBackoff boolean not null default false,
>     startAfter timestamp with time zone not null default now(),
>     startedOn timestamp with time zone,
>     singletonKey text,
>     singletonOn timestamp without time zone,
>     expireIn interval not null default interval '15 minutes',
>     createdOn timestamp with time zone not null default now(),
>     completedOn timestamp with time zone,
>     keepUntil timestamp with time zone NOT NULL default now() + interval '14 days',
>     on_complete boolean not null default true,
>     output jsonb
>   )
>```
>
**Pour pouvoir faire ça il faut repasser à l'EventDispatcher la transaction à chaque traitement d'évènement.**

En faisant ça il faut **ABSOLUMENT** que toutes les requêtes faites dans le handler passe par la transaction, sinon on
prend le risque d'avoir des deadlocks. C'est à cause de ces problèmes qu'on a décidé de ne plus utiliser les
transactions dans les handler d'évènement. Quand la gestion d'évènement a été mise en place on n'a pas assez communiqué
et formé les gens sur ce point.

En fonction des jobs on peut vouloir les lancer plusieurs fois ou pas. Il n'y a pas de garantie qu'un job n'est pas déjà
été exécuté. Par exemple le job marche, mais le conteneur plante avant que PgBoss mette à jour le job en BDD.
Le job aura été exécuté, mais il n'est pas marqué comme terminé. Dans cette situation PgBoss finira par relancer le job.
Pour chaque job il faut savoir si on peut / doit le rejouer en cas d'échec.
Par exemple un envoi de mail ne doit pas forcément être relancé, par opposition il y a peu d'impact si on calcule
plusieurs fois les résultats d'un participant à une campagne.

**En fonction du contexte il faut déterminer si jouer le job plusieurs fois est acceptable.**

💡 Une classe/service par job peut permettre de configurer la file facilement. (Nombre de tentatives par exemple).

💡 Il faudrait des logs pour monitorer l'ajout des jobs dans Datadog. (Avec de l'héritage c'est faisable facilement).

##### Exemple non contractuel

```js
class Job {
  constructor(config, queryBuilder, logger) {
    this.name = config.name;
    this.retryLimit = config.retryLimit || 0;
    this.retryDelay = config.retryDelay || 30;
    this.queryBuilder = queryBuilder;
    this.logger = logger;
  }

  async schedule(data) {
    await this.queryBuilder.raw(
      'INSERT INTO pgboss.job (name, data, retryLimit, retryDelay) VALUES (:name, :data, :retryLimit, :retryDelay)',
      {
        name: this.name,
        retryLimit: this.retryLimit,
        retryDelay: this.retryDelay,
        data,
      }
    );
    this.logger.info(`Job ${this.name} scheduled`);
  }
}

class JobRetryEnabled extends Job {
  constructor(queryBuilder, logger) {
    super({ name: 'RetryEnabled', retryLimit: 3 }, queryBuilder, logger);
  }
}

class JobRetryDisabled extends Job {
  constructor(queryBuilder, logger) {
    super({ name: 'RetryDisable' }, queryBuilder, logger);
  }
}
```

#### 3.Lancer un job

Il y aura un conteneur dédié pour jouer les jobs (dans la même idée que celui avec les CRON).

##### JobQueue

Pour ne pas dépendre trop directement de PgBoss il faut wrapper PgBoss dans une classe ou un service.

###### Exemple non contractuel
```js
const PgBoss = require('pg-boss');

class JobQueue {
  constructor() {
    this.pgBoss = new PgBoss(process.env.DATABASE_URL);
  }

  async performJob(name, handler) {
    await this.pgBoss.start();
    this.pgBoss.work(name, (job) => {
      handler(job.data);
    });
  }

  async stop() {
    await this.pgBoss.stop({ graceful: false, timeout: 1000 });
  }
}
```
On peut ajouté des tests automatisés sur le wrapper. C'est des tests qui ont un interêt en cas de montée de version de
PgBoss ou de changement le lib. (Ce n'est pas forcément utile de lancer ces tests dans la CI).

###### Exemple non contractuel
```js
beforeEach(async function () {
    await knex('job')
      .withSchema('pgboss')
      .insert({ name: 'job', data: { jobParam: 1 } });
  });

it('executes job when a job is added to the queue', function (done) {
  const handler = (params) => {
    try {
      expect(params).to.deep.equal({ jobParam: 1 });
      done();
    } catch (err) {
      done(err);
    }
  };

  const jobQueue = new JobQueue(knex);

  jobQueue.performJob('job', handler);
});
```

##### JobHandler

Pour les mêmes raisons (testabilité, indépendance, ...) il est nécéssaire de wrapper les jobs dans des classes / services.

###### Exemple non contractuel
Version sans transaction

```js
const DomainTransaction = require('../DomainTransaction');

class JobHandler {
  constructor(name, jobQueue, dependencies = {}) {
    this.name = name;
    this.dependencies = dependencies;
    this.jobQueue = jobQueue;
  }

  async perform() {
    const handler = (params) => this._handle({ ...params, ...this.dependencies });
    await this.jobQueue.performJob(this.name, handler);
  }

  async _handle() {
    throw new Error('NOT IMPLEMENTED');
  }

  async stop() {
    await this.jobQueue.stop({ graceful: false, timeout: 1000 });
  }
}

class JobPocHandler extends JobHandler {
  constructor(jobQueue, logger) {
    super('job', jobQueue);
    this.logger = logger;
  }

  async _handle({ date }) {
    this.logger.info(`Job Trx ${date}: STARTED`);
    setTimeout(() => this.logger.info(`Job ${date}: Sleeping`), 5000);
    await sleep(10000);
    this.logger.info(`Job ${date}: FINISHED`);
  }
}
```

Version avec transaction
```js
class JobTrxHandler extends JobHandler {
  async perform() {
    const handler = async (params) => {
      await DomainTransaction.execute(async (domainTransaction) => {
        await this._handle({ ...params, domainTransaction, ...this.dependencies });
      });
    };
    await this.jobQueue.performJob(this.name, handler);
  }
}

class JobPocTrxHandler extends JobTrxHandler {
  constructor(jobQueue, logger) {
    super('job', jobQueue);
    this.logger = logger;
  }

  async _handle({ domainTransaction }) {
    await domainTransaction
      .knexTransaction('organizations')
      .update({ name: `Orga-PgBoss` })
      .where({ id: 1 });
  }
}
```
**Les tests**
###### Exemple non contractuel
```js
it('update organization name', async function () {
    databaseBuilder.factory.buildOrganization({ id: 1, name: 'Orga' });
    await databaseBuilder.commit();

    const jobQueue = {
      performJob: async function (name, handler) {
        await handler();
      },
    };

    const jobHandler = new JobPocTrxHandler(jobQueue);

    await jobHandler.perform();

    const organization = await knex('organizations').where({ id: 1 }).first();
    expect(organization.name).equal('Orga-PgBoss');
  });
```

Je n'ai pas réussi à utiliser une transaction pour l'exécution du job et la mise à jour du job par PgBoss.
Il y a plusieurs requêtes faites par PgBoss :
- Récupération de job.
- Modification du statut job.
- Archivage des jobs.

La lib permet de créer une transaction à chaque fois, mais c'est complexe d'utiliser une même transaction pour le job
et la mise à jour du statut du job.

### Conclusion

Ça fonctionne et ce n'est pas trop dur à mettre en place. Il y a quand même quelques points d'attention.

**Avantage(s):**

- Permet d'avoir une cohérence entre les traitements d'un use case et l'ajout d'un job en BDD.


- Permet d'avoir une politique de retry gratuitement.


- Permet de gérer finement le nombre de consommateurs d'une file.

**Inconvénient(s):**

- Utilisation de la même transaction dans le use case et dans le handler d'évènement. (Pas un vrai problème, mais on a
déjà fait des bêtises)


- Pas de garantie qu'un job qui a échoué n'a pas été exécuté. (Il faut gérer ça avec de la configuration de file)

## Décision

Adoption de PgBoss pour la gestion des job asynchrones. PgBoss permet de rajouter un job en bdd dans la même transaction
que celle d'un use case. Ce qui résout notre problématique de départ.


## Conséquences

On utilise PgBoss et on commence une PR avec PgBoss pour le calcul des résultats d'une participation.
