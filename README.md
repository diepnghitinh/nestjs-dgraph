## Description

Nestjs Plugin for [Dgraph community > 20.0], Support HttpClient, Grpc

## Installation

```bash
npm i --save nestjs-dgraph @grpc/grpc-js
```

## Quick Start

Import `DgraphModule` to your ApplicationModule

```typescript

import { Module } from '@nestjs/common';
import { DgraphModule } from 'nestjs-dgraph';
import * as grpc from '@grpc/grpc-js';

@Module({
  imports: [
    DgraphModule.forRoot({
      stubs: [
        {
          // HTTP Client Configuration
          address: 'http://localhost:8080'
        },
        {
          // GRPC Client Configuration
          address: 'localhost:9080',
          credentials: grpc.credentials.createInsecure(),
        }
      ],
      auth_token: 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3',
      debug: true,
      initScript: async (client) => {
        client.newTxn().setSchema('external_id: string @index(exact) .');
      },
    })
  ],
})
export class ApplicationModule {}

```

Inject `DgraphService` to your services and access the DgraphClient

```typescript

@Injectable()
export class SomeService {
  constructor(dgraph: DgraphService) {}

  findAll() {
   const query = `{
      people(func: has(name)) {
        name
        type
      }
    }`;

    const req = await this.dgraph.call().newTxn().query(query);
    return req;
  }

  createMutation() {
    await this.dgraph
      .call()
      .newTxn()
      .mutate({
        set: [
          {
            name: 'Landlord',
            type: 'building',
          },
        ],
      });
  }

  updateMutation() {
    await this.dgraph
      .call()
      .newTxn()
      .mutate({
        set: [
          {
            uid: '0x2734',
            name: 'Landlord blue',
            type: 'building',
          },
        ],
      });
  }

  runMutationDelete() {
    await this.dgraph
      .call()
      .newTxn()
      .mutateDelete({
        uid: '0x2734',
        name: null,
        type: null,
      });
  }

}

```