import { MethodRouterService } from './method-router.service';
import type { RuntimeRoute } from '../types/runtime-route.type';

function makeRoute(overrides: Partial<RuntimeRoute> = {}): RuntimeRoute {
  return {
    uid: 'uid',
    serviceId: 'svc-uid',
    serviceName: 'svc',
    serviceProtocol: 'http',
    host: null,
    pathPattern: '/test',
    method: 'GET',
    stripPrefix: false,
    priority: 0,
    instances: [],
    ...overrides,
  };
}

describe('MethodRouterService', () => {
  let service: MethodRouterService;

  beforeEach(() => {
    service = new MethodRouterService();
  });

  describe('insert and match', () => {
    it('matches a route on its specified method', () => {
      const route = makeRoute({ pathPattern: '/users', method: 'GET' });
      service.insert(route);
      const result = service.match('GET', '/users');
      expect(result).not.toBeNull();
      expect(result!.route).toBe(route);
    });

    it('does not match a GET route on POST', () => {
      service.insert(makeRoute({ pathPattern: '/users', method: 'GET' }));
      expect(service.match('POST', '/users')).toBeNull();
    });

    it('registers a method-null route across all HTTP methods', () => {
      const route = makeRoute({ pathPattern: '/health', method: null });
      service.insert(route);

      const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'] as const;
      for (const method of methods) {
        expect(service.match(method, '/health')).not.toBeNull();
      }
    });

    it('returns null when no route is registered', () => {
      expect(service.match('GET', '/nonexistent')).toBeNull();
    });

    it('extracts path params correctly', () => {
      const route = makeRoute({ pathPattern: '/users/:id', method: 'GET' });
      service.insert(route);
      const result = service.match('GET', '/users/42');
      expect(result!.params).toEqual({ id: '42' });
    });
  });

  describe('clear', () => {
    it('removes all previously inserted routes', () => {
      service.insert(makeRoute({ pathPattern: '/users', method: 'GET' }));
      service.clear();
      expect(service.match('GET', '/users')).toBeNull();
    });

    it('allows insertion of new routes after clear', () => {
      service.insert(makeRoute({ pathPattern: '/old', method: 'GET' }));
      service.clear();
      const newRoute = makeRoute({ pathPattern: '/new', method: 'POST' });
      service.insert(newRoute);
      expect(service.match('POST', '/new')).not.toBeNull();
      expect(service.match('GET', '/old')).toBeNull();
    });
  });
});
