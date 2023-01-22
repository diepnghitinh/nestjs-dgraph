import * as grpc from '@grpc/grpc-js';
import { DgraphClientStub } from './dgraph-factory.interface';

export interface DgraphModuleOptions {
  stubs?: {
    address?: string | null;
    port?: number | null;
    credentials?: grpc.ChannelCredentials | null;
    options?: object | null;
  }[];
  debug?: boolean;
  api_key?: string | null;
  auth_token?: string | null;
  headers?: object;
  initScript?: (client: DgraphClientStub) => void;
}
