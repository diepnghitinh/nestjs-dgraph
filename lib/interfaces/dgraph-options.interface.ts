import * as grpc from '@grpc/grpc-js';

export interface DgraphModuleOptions {
  stubs?: {
    address?: string | null;
    port?: number | null;
    credentials?: grpc.ChannelCredentials | null;
    options?: object | null;
  }[];
  debug?: boolean;
}
