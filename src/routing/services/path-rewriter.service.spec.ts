import { PathRewriterService } from './path-rewriter.service';
import type { RuntimeRoute } from '../types/runtime-route.type';

function makeRoute(overrides: Partial<RuntimeRoute> = {}): RuntimeRoute {
  return {
    uid: 'uid',
    serviceId: 'svc-uid',
    serviceName: 'svc',
    serviceProtocol: 'http',
    host: null,
    pathPattern: '/api',
    method: null,
    stripPrefix: false,
    priority: 0,
    instances: [],
    ...overrides,
  };
}

describe('PathRewriterService', () => {
  let service: PathRewriterService;

  beforeEach(() => {
    service = new PathRewriterService();
  });

  describe('rewrite', () => {
    it('returns the original path unchanged when stripPrefix is false', () => {
      const route = makeRoute({ pathPattern: '/api', stripPrefix: false });
      expect(service.rewrite('/api/users', route)).toBe('/api/users');
    });

    it('strips an exact-path prefix', () => {
      const route = makeRoute({ pathPattern: '/api/v1', stripPrefix: true });
      expect(service.rewrite('/api/v1/users', route)).toBe('/users');
    });

    it('returns "/" when stripping an exact path leaves nothing', () => {
      const route = makeRoute({ pathPattern: '/api/v1', stripPrefix: true });
      expect(service.rewrite('/api/v1', route)).toBe('/');
    });

    it('strips a wildcard prefix (/*)', () => {
      const route = makeRoute({ pathPattern: '/api/v1/*', stripPrefix: true });
      expect(service.rewrite('/api/v1/users/123', route)).toBe('/users/123');
    });

    it('returns "/" when wildcard strip leaves only the separator', () => {
      const route = makeRoute({ pathPattern: '/api/v1/*', stripPrefix: true });
      expect(service.rewrite('/api/v1/', route)).toBe('/');
    });

    it('returns "/" when wildcard strip leaves empty string', () => {
      const route = makeRoute({ pathPattern: '/api/*', stripPrefix: true });
      expect(service.rewrite('/api/', route)).toBe('/');
    });

    it('returns originalPath unchanged when it does not start with exact pattern', () => {
      const route = makeRoute({ pathPattern: '/api/v1', stripPrefix: true });
      expect(service.rewrite('/other/path', route)).toBe('/other/path');
    });

    it('returns originalPath unchanged when wildcard prefix does not match', () => {
      const route = makeRoute({ pathPattern: '/api/*', stripPrefix: true });
      expect(service.rewrite('/other/path', route)).toBe('/other/path');
    });

    it('correctly strips a single-segment prefix', () => {
      const route = makeRoute({ pathPattern: '/users/*', stripPrefix: true });
      expect(service.rewrite('/users/123', route)).toBe('/123');
    });
  });
});
