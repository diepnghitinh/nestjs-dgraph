import * as dgraph_js_grpc from 'dgraph-js';
import * as dgraph_js_http from 'dgraph-js-http';
import { DgraphModuleOptions } from '../interfaces/dgraph-options.interface';
import { IDgraphFactory } from '../interfaces/dgraph-factory.interface';

export class DgraphClientMap {
    private client_grpc: dgraph_js_grpc.DgraphClient[];
    private client_http: dgraph_js_http.DgraphClient[];
}