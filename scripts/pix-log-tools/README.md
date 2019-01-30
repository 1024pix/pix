# Pix Log Tools

Quelques outils pour exploiter les logs de Scalingo.

Note : nécessite [jq](https://stedolan.github.io/jq/).

Note : certaines expressions jq utilisent `strflocaltime`. si la commande `date` renvoie du CET pour vous, les horaires seront uniformes dans les sorties des scripts (14:00:00 = 14:00:00 CET). Sinon ça va moins bien marcher.

Note : pour les utiliser, par exemple, les ajouter à votre `~/bin`. Modifiez les à votre guise.

## Séparer les logs

La première étape est de séparer les logs routers, json, et les erreurs.

    $ pix-unpack-logs.sh pix-api-production_5a82f5d3fb0de60012c0861b.log-2018121716
    Sorting logs...

    Extracting json logs...
    == First json log ==
    {"event":"response","timestamp":1545052534209,"id":"1545052534209:pix-api-production-web-7:87:jpr11jws:29672","instance":"http://pix-api-production-web-7:20534","labels":[],"method":"post","path":"/api/answers","query":{},"responseTime":18,"responseSentTime":18,"statusCode":201,"pid":87,"httpVersion":"1.1","source":{"remoteAddress":"10.127.0.11","userAgent":"Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0","referer":"https://app.pix.fr/assessments/1100887/challenges/recUNDFYjmemxaIuI"},"route":"/api/answers","log":[],"tags":["api"],"config":{}}

    Extracting router logs...
    == First router log ==
    2018-12-17 14:15:34.371836275 +0100 CET [router] method=POST path="/api/answers" host=pix-api-production.scalingo.io request_id=6a692dd8-dd2d-4316-b67e-c11241a6db60 container=web-7 from="10.127.0.1" protocol=https status=201 duration=0.025s bytes=551 referer="https://app.pix.fr/assessments/1100887/challenges/recUNDFYjmemxaIuI" user_agent="Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0"
    == Last router log ==
    2018-12-17 16:43:37.183627534 +0100 CET [router] method=POST path="/api/answers" host=pix-api-production.scalingo.io request_id=6a692dd8-dd2d-4316-b67e-c11241a6db60 container=web-7 from="10.127.0.1" protocol=https status=201 duration=0.025s bytes=551 referer="https://app.pix.fr/assessments/1100887/challenges/recUNDFYjmemxaIuI" user_agent="Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:62.0) Gecko/20100101 Firefox/62.0"

    Extracting error logs...
    == First error log ==
    2018-12-17 15:52:03.982069946 +0100 CET [web-9] (node:68) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'type' of undefined

    Done.

## Stack traces

Les stack traces sont dans `error.logs`

    $ cat error.logs
    2018-12-17 15:52:03.982069946 +0100 CET [web-9] (node:68) UnhandledPromiseRejectionWarning: TypeError: Cannot read property 'type' of undefined
    2018-12-17 15:52:03.982072968 +0100 CET [web-9] at challengeRepository.get.then.catch (/app/lib/application/challenges/challenge-controller.js:18:47)
    2018-12-17 15:52:03.982074236 +0100 CET [web-9] at <anonymous>
    2018-12-17 15:52:03.982075463 +0100 CET [web-9] at process._tickDomainCallback (internal/process/next_tick.js:228:7)
    2018-12-17 15:52:03.982076579 +0100 CET [web-9] (node:68) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 135)
    2018-12-17 15:52:03.982107277 +0100 CET [web-9] (node:68) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.

## Filtrer et formater

Ensuite, les trois fichiers générés peuvent être filtrés sommairement et formatés avec les commandes suivantes.

### Récupérer les erreurs HTTP json

    $ pix-errors.sh
    instance	time	duration	code	method	path	referer
    web-11	15:05:29	1.039	500	post	/api/password-reset-demands	https://app.pix.fr/mot-de-passe-oublie
    web-10	15:05:29	2.045	500	post	/api/password-reset-demands	https://app.pix.fr/mot-de-passe-oublie
    web-6	15:05:29	3.098	500	post	/api/password-reset-demands	https://app.pix.fr/mot-de-passe-oublie
    web-8	15:05:29	4.083	500	post	/api/password-reset-demands	https://app.pix.fr/mot-de-passe-oublie
    web-14	15:05:29	4.873	500	post	/api/password-reset-demands	https://app.pix.fr/mot-de-passe-oublie
    ...

### Récupérer les erreurs HTTP router

    $ pix-router-errors.sh
    container	time	duration	status	method	path	referer
    web-12	14:15:49.256681859	0.000s	499	GET	"/api/assessments/1100839"	"https://app.pix.fr/assessments/1100839/challenges/recUuLdYdKOoOh2W2"
    web-15	14:15:49.354817851	0.002s	499	GET	"/api/answers?assessment=1100839&challenge=recUuLdYdKOoOh2W2"	"https://app.pix.fr/assessments/1100839/challenges/recUuLdYdKOoOh2W2"
    web-10	14:16:07.545825348	0.001s	499	GET	"/api/assessments/1100828"	"https://app.pix.fr/assessments/1100828/challenges/recTN0KjnA5Igcuok"
    web-2	14:16:16.383948662	0.001s	499	GET	"/api/assessments/1100851"	"https://app.pix.fr/assessments/1100851/challenges/recUuLdYdKOoOh2W2"
    web-2	14:16:16.455286960	0.001s	499	GET	"/api/answers?assessment=1100851&challenge=recUuLdYdKOoOh2W2"	"https://app.pix.fr/assessments/1100851/challenges/recUuLdYdKOoOh2W2"
    ...

### Explorer les requêtes http longues

    $ pix-long-queries.sh 10000
    instance	time	responseTime	statusCode	method	path	referer
    web-4	15:02:56	12.522	200	get	/api/assessments/1101259/next/reciznBsSNTdxAARn	https://app.pix.fr/assessments/1101259/challenges/reciznBsSNTdxAARn
    web-4	15:02:56	12.534	200	get	/api/assessments/1101262/next/recdazRdbu92xPtUv	https://app.pix.fr/assessments/1101262/challenges/recdazRdbu92xPtUv
    web-4	15:02:56	12.542	200	get	/api/assessments/1101111/next/recur8n4f4ofUjkzc	https://app.pix.fr/assessments/1101111/challenges/recur8n4f4ofUjkzc
    web-4	15:03:09	13.533	201	post	/api/answers	https://app.pix.fr/assessments/1101231/challenges/receop4TZKvtjjG0V
    web-4	15:03:09	13.543	201	post	/api/answers	https://app.pix.fr/assessments/1101233/challenges/recRA5QZhuVoMTObO
    ...

### Récupérer l'occupation mémoire

    $ pix-ops.sh
    host	timestamp	time	rss	heapTotal	heapUsed	external
    web-11	1545052534450	14:15:34	225181696	166473728	101146048	886310
    web-16	1545052535692	14:15:35	192167936	139112448	71552296	7528655
    web-12	1545052535745	14:15:35	195244032	147599360	80193616	942517
    web-13	1545052536182	14:15:36	179822592	146821120	110436528	997820
    web-10	1545052536822	14:15:36	188153856	166572032	109402152	889415
    ...
