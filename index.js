import Vue from 'vue';

const defaults = {
  routes: {
    guest: '/public',
    auth: '/account',
  },
};

export function middleware({
  router,
  guard = () => false,
  routes = {},
  context,
}) {
  return (to, from, next) => {
    const route = to.matched.find((r) => typeof r.meta.auth === 'boolean');
    const redirectRoutes = { ...defaults.routes, ...routes };
    const ctx = {
      to,
      from,
      ...Vue.prototype,
      ...context,
    };

    function getRouteTo() {
      const meta = to.meta.authRedirectTo || route.meta.authRedirectTo;

      return typeof meta === 'function' ? meta(ctx) : meta;
    }

    function access() {
      const authGuard = to.meta.authGuard || route.meta.authGuard;

      return authGuard ? authGuard(ctx) : guard(ctx);
    }

    const actions = [
      {
        condition: route && route.meta.auth && !access(),
        callback: () => router.replace(getRouteTo() || redirectRoutes.guest),
      },
      {
        condition: route && !route.meta.auth && access(),
        callback: () => router.replace(getRouteTo() || redirectRoutes.auth),
      },
      {
        condition: true,
        callback: () => next(),
      },
    ];

    actions.find((action) => action.condition).callback();
  };
}

export default {
  install(_Vue, options) {
    options.router.beforeEach(middleware(options));
  },
};
