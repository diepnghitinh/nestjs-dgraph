import { Injectable, Inject } from '@nestjs/common';
import { DGRAPH_MODULE_OPTIONS } from './dgraph.constants';
import { DgraphModuleOptions } from './interfaces/dgraph-options.interface';
import * as dgraph_js_grpc from 'dgraph-js';
import * as dgraph_js_http from 'dgraph-js-http';
import * as grpc from '@grpc/grpc-js';
import { DgraphFactory, DgraphHttp } from './factories/dgraph-factory';
import { IDgraphFactory, DgraphClientStub } from './interfaces/dgraph-factory.interface';

@Injectable()
export class DgraphService {

  private _client: DgraphFactory;
  private _meta: grpc.Metadata;
  private _dgraphFactory = new DgraphFactory()
  private _clients: IDgraphFactory[];

  get client(): DgraphFactory {
    return this._client;
  }

  get meta(): grpc.Metadata {
    return this._meta;
  }

  constructor(@Inject(DGRAPH_MODULE_OPTIONS) options: DgraphModuleOptions) {
    this.createClient(options);
  }

  createClient(options: DgraphModuleOptions) {
    if (!this._client) {
      // List clients
      this._clients = options.stubs.map(stub => {
        var protocal = (stub.address.indexOf("http://") == 0 || stub.address.indexOf("https://") == 0) ? 'http' : 'grpc';
        var clientDgraph = this._dgraphFactory.instance(protocal, stub, options).DgraphClientStub();
        return clientDgraph;
      });

      this._client = this._dgraphFactory.DgraphClient(...this._clients)

    }
    options.initScript(this.call());
    return this._client;
  }

  call() {
    const c = this._client.anyClient();
    return c;
  }

  close() {
    if (this._clients) {
      this._clients.forEach(stub => {
        stub.close();
      });
      this._clients = null;
    }
    this._client = null;
  }
}
