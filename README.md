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
 │   │   ├── jwt.guard.ts               # Guards for JWT authentication.
 │   │   ├── auth.service.ts            # Handles all authentication logic.
 │   │   └── current-user.decorator.ts  # Custom decorator for accessing the current user.
 │   ├── interfaces/
 │   │   ├── auth.controller.ts         # Controller for authentication-related endpoints.
 │   │   ├── user.controller.ts         # Controller for user-related operations.
 │   │   └── dto/                       # Data transfer objects for API requests and responses.
 ├── domain/
 │   └── user/
 │       ├── user.entity.ts             # User entity definition.
 │       └── user.entity.spec.ts        # Tests for user entity behaviors.
 ├── infrastructure/
 │   ├── orm/
 │   │   ├── mikro-orm.config.ts        # MikroORM configuration.
 │   │   └── migrations/                # Database migrations.
 │   └── email.service.ts               # Service for sending emails via SendGrid.
 └── main.ts                            # Entry point of the application.

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
