import { DynamicModule, Module } from '@nestjs/common';
import { DgraphCoreModule } from './dgraph-core.module';
import { DgraphModuleOptions } from './interfaces/dgraph-options.interface';

@Module({
})
export class DgraphModule {
  static forRoot(options: DgraphModuleOptions): DynamicModule {
    return {
      module: DgraphModule,
      imports: [DgraphCoreModule.forRoot(options)],
    };
  }
}
