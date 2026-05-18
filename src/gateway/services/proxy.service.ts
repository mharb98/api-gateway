import {
  BadGatewayException,
  GatewayTimeoutException,
  HttpException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import httpProxy from 'http-proxy';
import { AppLogger, LogSeverity } from '../../common/logger.js';

@Injectable()
export class ProxyService implements OnModuleInit {
  private proxy: httpProxy;

  onModuleInit(): void {
    this.proxy = httpProxy.createProxyServer({
      proxyTimeout: 30_000,
      timeout: 30_000,
    });
  }

  forward(req: Request, res: Response, target: string, rewrittenPath: string): Promise<void> {
    const qsIndex = req.url.indexOf('?');
    const qs = qsIndex !== -1 ? req.url.slice(qsIndex) : '';
    req.url = rewrittenPath + qs;

    return new Promise<void>((resolve, reject) => {
      let settled = false;

      const settle = (fn: () => void): void => {
        if (settled) return;
        settled = true;
        fn();
      };

      res.once('finish', () => settle(resolve));
      res.once('close', () => settle(resolve));

      this.proxy.web(req, res, { target }, (err: NodeJS.ErrnoException) => {
        if (res.headersSent) {
          AppLogger.error({
            severity: LogSeverity.HIGH,
            exception: err,
            title: 'ProxyService',
          });
          if (!res.writableEnded) res.end();
          settle(resolve);
        } else {
          settle(() => reject(this.mapError(err)));
        }
      });
    });
  }

  private mapError(err: NodeJS.ErrnoException): HttpException {
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET') {
      return new BadGatewayException('Upstream service unavailable');
    }
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
      return new GatewayTimeoutException('Upstream service timed out');
    }
    return new BadGatewayException('Proxy error');
  }
}
