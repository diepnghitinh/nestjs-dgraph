import {
  DynamicModule,
  Module,
  OnApplicationShutdown,
  OnModuleDestroy,
  Global,
  Inject,
  Provider,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { DgraphModuleOptions } from './interfaces/dgraph-options.interface';
import { DGRAPH_MODULE_OPTIONS } from './dgraph.constants';
import { DgraphService } from './dgraph.service';

@Global()
@Module({
  providers: [DgraphService],
  exports: [DgraphService],
})
export class DgraphCoreModule implements OnApplicationShutdown {
  constructor(
    @Inject(DGRAPH_MODULE_OPTIONS) private readonly options: DgraphModuleOptions,
    private readonly dgraphService: DgraphService,
  ) {}

  static forRoot(options: DgraphModuleOptions): DynamicModule {
    const dgraphModuleOptions: Provider = {
      provide: DGRAPH_MODULE_OPTIONS,
      useValue: options,
    };

    return {
      module: DgraphCoreModule,
      providers: [dgraphModuleOptions, DgraphService],
      exports: [DgraphService],
    };
  }

  async onApplicationShutdown() : Promise<void> {
    this.dgraphService.close();
  }
}
