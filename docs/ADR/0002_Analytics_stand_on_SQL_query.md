# Analytics epic, should rely on SQL queries.

## Status

Accepted

## Context

Analytics Epic, do not need a domain object to be display on front.\
It's based on sum/average/group of data that already exists.

## Decision

Use SQL / PGSQL queries to carry logical operations rather than the usecase.

## Consequences

\+ best performance/maintainability ratio.\
\+ can be tested.\
\- bigger request in repository file used for Analytics.\
\- boiler plate usage of controller / usecase files.\
