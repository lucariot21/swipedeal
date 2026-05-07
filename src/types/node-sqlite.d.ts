declare module "node:sqlite" {
  export class StatementSync<T = unknown> {
    run(params?: Record<string, unknown> | unknown[]): {
      changes: number;
      lastInsertRowid: number | bigint;
    };
    get(params?: Record<string, unknown> | unknown[]): T | undefined;
    all(params?: Record<string, unknown> | unknown[]): T[];
  }

  export class DatabaseSync {
    constructor(path: string, options?: { open?: boolean; readOnly?: boolean });
    exec(sql: string): void;
    prepare<T = unknown>(sql: string): StatementSync<T>;
    close(): void;
  }
}
