## Description

This repository is structured following Domain-Driven Design (DDD) principles to align the software design closely with
the domain complexities.

The project is organized into several layers, each with a specific role and responsibility, promoting a clean separation
of concerns and high modularity.

### Folder Structure

```
src/
├── application/
│   ├── auth/
│   │   ├── jwt-guard.service.ts
│   │   ├── auth.service.ts
│   │   └── current-user.decorator.ts
│   ├── interfaces/
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   └── dto/
│   │       ├── signup-with-email.request.ts
│   │       ├── user-profile.response.ts
│   │       └── reset-password.request.ts
├── domain/
│   └── user/
│       ├── user.entity.ts
│       └── user.entity.spec.ts
├── infrastructure/
│   ├── orm/
│   │   ├── mikro-orm.config.ts
│   │   └── migrations/
│   │       ├── Migration20240501024315.ts
│   │       └── Migration20240501034301_user_statistics.ts
│   └── email.service.ts
└── main.ts
```

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## License

[MIT licensed](LICENSE).
