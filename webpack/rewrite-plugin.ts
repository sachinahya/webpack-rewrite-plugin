import fs from 'fs';
import path from 'path';
import { ResolvePluginInstance, Resolver } from 'webpack';

export interface RewritePluginOptions {
  suffix: string;
  extensions?: string[];
  verbose?: boolean;
}

export class RewritePlugin implements ResolvePluginInstance {
  suffix: string;
  extensions: string[];
  verbose: boolean;

  constructor(options: RewritePluginOptions) {
    if (!options.suffix) {
      throw new Error('suffix cannot be empty');
    }

    this.verbose = options.verbose ?? false;
    this.extensions = options.extensions ?? ['.ts', '.tsx', '.js'];
    this.suffix = options.suffix;
  }

  private log(message: unknown, ...optionalParams: unknown[]) {
    if (this.verbose) {
      console.log(message, ...optionalParams);
    }
  }

  apply(resolver: Resolver): void {
    const target = resolver.ensureHook('file');

    resolver
      .getHook('file')
      .tapAsync(this.constructor.name, (request, resolveContext, callback) => {
        const currentPath = request.path;
        this.log('Request', currentPath);

        if (!currentPath) {
          this.log('Path not yet resolved', currentPath);
          return callback();
        }

        const currentPathExt = path.extname(currentPath);

        if (!this.extensions.includes(currentPathExt)) {
          this.log('Path does not match extensions', currentPath);
          return callback();
        }

        if (path.basename(currentPath, currentPathExt).endsWith(this.suffix)) {
          this.log('File already rewritten', currentPath);
          return callback();
        }

        const rewrittenPath = currentPath.replace(
          currentPathExt,
          `${this.suffix}$&`
        );
        const rewrittenFileExists = fs.existsSync(rewrittenPath);

        if (!rewrittenFileExists) {
          this.log('File not found', rewrittenPath);
          return callback();
        }

        const newRequest: typeof request = {
          ...request,
          path: rewrittenPath,
        };

        this.log('Rewriting file', currentPath, rewrittenPath);

        return resolver.doResolve(
          target,
          newRequest,
          null,
          resolveContext,
          callback
        );
      });
  }
}
