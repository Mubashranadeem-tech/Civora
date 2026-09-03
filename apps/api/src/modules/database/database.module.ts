import { Global, Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@civora/db';

export const DATABASE_TOKEN = 'DATABASE';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_TOKEN,
      useFactory: (config: ConfigService) => {
        const url =
          config.get<string>('DATABASE_URL') ||
          process.env.DATABASE_URL ||
          'postgresql://civora_user:civora_pass@localhost:5432/civora';
        const client = postgres(url, { max: 10 });
        return drizzle(client, { schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_TOKEN],
})
export class DatabaseModule {}
