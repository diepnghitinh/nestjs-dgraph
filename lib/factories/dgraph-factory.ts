import * as dgraph_js_grpc from 'dgraph-js';
import * as dgraph_js_http from 'dgraph-js-http';
import { IDgraphFactory, DgraphClientStub } from '../interfaces/dgraph-factory.interface';
import { DgraphModuleOptions } from '../interfaces/dgraph-options.interface';
import axios from 'axios';
import * as grpc from '@grpc/grpc-js';

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

    static stubs: dgraph_js_grpc.DgraphClientStub[] = [];

    private stub: any;

    private options: DgraphModuleOptions;

    private _client: dgraph_js_grpc.DgraphClient;
    private _txn: dgraph_js_grpc.Txn;

    private meta = new grpc.Metadata();

    constructor(_stub: any, _options: DgraphModuleOptions) {
        this.stub = _stub;
        DgraphGrpc.stubs.push(_stub);
        this.options = _options;
    }

    get client(): dgraph_js_grpc.DgraphClient {
        return this._client;
    }

    get name(): string {
        return 'GRPC';
    }

    DgraphClientStub(): any {
        this.healhcheck();
        this.stub = new dgraph_js_grpc.DgraphClientStub(
            this.stub.address,
            this.stub.credentials,
        );
        console.log(this.stub);
        return this;
    }

    DgraphClient(): IDgraphFactory {
        this._client = new dgraph_js_grpc.DgraphClient(this.stub);
        if (this.options.auth_token) {
            this.meta.add('auth-token', this.options.auth_token);
        }

        if (this.options.api_key) { 
            this.meta.add('Authorization', this.options.api_key);
        }

        for (var key in this.options.headers) {
            if ( this.options.headers?.hasOwnProperty(key)) {
                this.meta.set(key,  this.options.headers[key]);
            }
        }

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
        return this._txn.query(q, this.meta);
    }

    async queryWithVars(q: string, vars?: any) {
        return this._txn.queryWithVars(q, this.meta, vars);
    }

    async mutate(data: any) {
        const mu = new dgraph_js_grpc.Mutation();
        mu.setSetJson(data);

        const req = new dgraph_js_grpc.Request();
        req.setCommitNow(true);
        req.setMutationsList([mu]);

        await this._txn.doRequest(req);
    }

    async mutateDelete(data: any) {
        const mu = new dgraph_js_grpc.Mutation();
        mu.setDeleteJson(data);

        const req = new dgraph_js_grpc.Request();
        req.setCommitNow(true);
        req.setMutationsList([mu]);

        await this._txn.doRequest(req);
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

    async mutateDelete(data: any) {
        await this._txn.mutate({deleteJson: data, commitNow: true});
    }

    healhcheck() {
    }

    close(): void {
        throw new Error('Method not implemented.');
    }

}