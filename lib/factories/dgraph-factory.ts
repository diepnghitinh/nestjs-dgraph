import * as dgraph_js_grpc from 'dgraph-js';
import * as dgraph_js_http from 'dgraph-js-http';
import { IDgraphFactory, DgraphClientStub } from '../interfaces/dgraph-factory.interface';
import { DgraphModuleOptions } from '../interfaces/dgraph-options.interface';
import axios from 'axios';

export class DgraphFactory {

    private clients: IDgraphFactory[];

    private client_map: DgraphClientStub[] = [];

    instance(protocal: string, stub: any, options: DgraphModuleOptions): IDgraphFactory {
      switch (protocal) {
        case 'grpc':
            return new DgraphGrpc(stub, options);
        case 'http':
            return new DgraphHttp(stub, options);
      }
      return null;
    }

    DgraphClient(...clients: IDgraphFactory[]): DgraphFactory {
        this.clients = clients;

        this.clients.forEach((c: IDgraphFactory) => {
            if (c instanceof dgraph_js_http.DgraphClientStub) {
                this.client_map.push(c.DgraphClient())
            } else {
                this.client_map.push(c.DgraphClient());
            }
        });

        return this;
    }

    anyClient(): DgraphClientStub {
        let num = Math.floor(Math.random() * this.client_map.length);
        return this.client_map[num];
    }
}

export class DgraphGrpc implements IDgraphFactory {

    private _client: dgraph_js_grpc.DgraphClient;
    private _txn: dgraph_js_grpc.Txn;

    constructor(stub: any, options: DgraphModuleOptions) {}

    get client(): dgraph_js_grpc.DgraphClient {
        return this._client;
    }

    get name(): string {
        return 'GRPC';
    }

    DgraphClientStub(): any {
        throw new Error('Method not implemented.');
    }

    DgraphClient(): IDgraphFactory {
        // for (var key in this.options.headers) {
        //     if ( this.options.headers?.hasOwnProperty(key)) {
        //     this._client.set(key,  this.options.headers[key]);
        //     }
        // }
        throw new Error('Method not implemented.');
    }

    newTxn(options?: any): IDgraphFactory {
        this._txn = this.client.newTxn(options);
        return this;
    }

    async query() {
        throw new Error('Method not implemented.');
    }

    queryWithVars() {
        throw new Error('Method not implemented.');
    }

    mutate(data: any) {
        throw new Error('Method not implemented.');
    }

    healhcheck() {
    }

    close(): void {
        throw new Error('Method not implemented.');
    }
}

export class DgraphHttp implements IDgraphFactory {

    static stubs: dgraph_js_http.DgraphClientStub[] = [];

    private stub: any;

    private options: DgraphModuleOptions;

    // 
    private _client: dgraph_js_http.DgraphClient;
    private _txn: dgraph_js_http.Txn;

    constructor(_stub: any, _options: DgraphModuleOptions) {
        this.stub = _stub;
        DgraphHttp.stubs.push(_stub);
        this.options = _options;
    }

    get client(): dgraph_js_http.DgraphClient {
        return this._client;
    }

    get name(): string {
        return 'HTTP';
    }

    DgraphClientStub(): any {
        console.log('DgraphClientStub HTTP');
        this.healhcheck();
        this.stub = new dgraph_js_http.DgraphClientStub(
            this.stub.address
        );
        return this;
    }

    DgraphClient(): IDgraphFactory {
        this._client = new dgraph_js_http.DgraphClient(this.stub);
        if (this.options.auth_token)
            this._client.setAlphaAuthToken(this.options.auth_token);
        if (this.options.api_key)
            this._client.setSlashApiKey(this.options.api_key);
        if (this.options.debug) {
            this._client.setDebugMode(true);
        }
        return this;
    }

    newTxn(options?: any): IDgraphFactory {
        this._txn = this.client.newTxn(options);
        return this;
    }

    async query(q: string) {
        return this._txn.query(q);
    }

    async queryWithVars(q: string, vars?: any) {
        return this._txn.queryWithVars(q, vars);
    }

    async mutate(data: any) {
        await this._txn.mutate({setJson: data, commitNow: true});
    }

    healhcheck() {
    }

    close(): void {
        throw new Error('Method not implemented.');
    }

}