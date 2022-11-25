import * as grpc from '@grpc/grpc-js';
import { DgraphModuleOptions } from './dgraph-options.interface';

export interface IDgraphFactory {
  get client(): any;
  get name(): string;
  DgraphClientStub(): IDgraphFactory;
  DgraphClient(): IDgraphFactory;
  newTxn(options?: any): IDgraphFactory;
  query(q: string): any;
  queryWithVars(q: string, vars?: any): any;
  mutate(data: any): any;
  mutateDelete(data: any): any;
  close(): void;
}

export interface DgraphClientStub {
  query(q: string): any;
  newTxn(options?: object): any;
}