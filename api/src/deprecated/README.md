# Deprecated context

`deprecated` is a context used to isolate endpoints that are aggregates of multiple bounded contexts and currently cause very strong couplings with other contexts.

These endpoints are moved to `deprecated` to resolve the existing couplings and clearly identify the routes that need to be reworked.

## Important

1. No other context should depend on the `deprecated` context.
2. You should not add new features to `deprecated` context.
