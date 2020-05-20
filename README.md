# vue-router-auth
Flexible routes setup. Closing routes for authorized / unauthorized users, users with specific roles.

This module is designed for the fact that you already have an authorization system and you need to close the pages for unauthorized / authorized users.
<br>
<br>
If you find an error, incorrect behavior please open the corresponding
[issue](https://github.com/17axah/vue-router-auth/issues). <br>
Please also rate this [repository](https://github.com/17axah/vue-router-auth). :blush:

<hr>

## :book: Usage

```bash
$ npm i vue-router-auth
```

```js
import Vue from 'vue';
import VueRouterAuth from 'vue-router-auth';

const options = {
  router,
  guard: ({ $auth }) => $auth.loggedIn,
};

Vue.use(VueRouterAuth, options);
```
or
```js
import { middleware } from 'vue-router-auth';

const options = {
  router,
  guard: ({ $auth }) => $auth.loggedIn,
};

router.beforeEach(middleware(options));
```

After which you need to configure the routes:

```js
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'login',
        component: () => import('pages/Login.vue'),
        meta: {
          auth: {
            access: false,
          },
        },
      },
    ],
  },
  {
    path: '/account',
    component: () => import('layouts/Auth.vue'),
    meta: {
      auth: {
        access: true,
      },
    },
    children: [
      {
        path: '',
        component: () => import('pages/Account.vue'),
      },
      {
        path: 'settings',
        component: () => import('pages/Settings.vue'),
      },
    ],
  },
];
```

## :gear: Customization
### Options
List of passed options during initialization:

name    | default                                           | description                                                                                                                                                                                                                     | required | type
--------|---------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|--------
router  | -                                                 | app router                                                                                                                                                                                                                      | true     | Object
guard   | <pre>() => false</pre>                            | Function to check access. It has a context argument: ***to***, ***from***, ***Vue.prototype*** and the context that was passed in the module option. Use read-only context (**must be redefined**)                              | true     | Function
routes  | <pre>{ guest: '/public', auth: '/account' }</pre> | Routes for redirecting authorized, unauthorized users, users with specific roles.                                                                                                                                               | false    | Object
context | <pre>{}</pre>                                     | The data that will be available in the functions (***guard***, ***redirect***)                                                                                                                                                  | false    | Object

Also, for full work, you need to configure the meta field in routes:

### Route options
List of options passed to the *meta.auth* route field:

name     | description                                          | type
---------|------------------------------------------------------|--------
access   | A flag indicating the closure of the route.          | Boolean or String
redirect | route or function returning a route.                 | Function or Object or String
guard    | individual ***guard*** function for a specific route | Function

***functions redirect and guard have the same arguments as the main guard function.***

### Description
To close the route for unauthorized users, you must specify true in the *meta.auth.access* route field.
To close the route for authorized users, set the *meta.auth.access* field to false.
In this case, the *guard* function should return true for authorized users and false for unauthorized users.
To configure user redirection, use the *routes* option.
*guest* - the route where the unauthorized user will be redirected, *auth* - the authorized user.
You can also specify the redirection route individually for each route in the *meta.auth.redirect* field.
The guard and redirect functions in the arguments receive a context, to expand it use the *context* option.

#### Using roles
In order to close the route for a specific role in the *meta.auth.access* route field, you must specify the role name,
in this case, the *guard* function should return a string with the name of this role, otherwise redirection will occur.
To configure redirection for a specific role, you need to add a field to the *routes* option with the name of this role. 


### :eyes: Examples
```js
import { middleware } from 'vue-router-auth';
import auth from 'auth-module'; // for example

const options = {
  router,
  guard: ({ auth }) => auth.loggedIn,
  context: {
    auth,
  },
};

router.beforeEach(middleware(options));
```

```js
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'login',
        component: () => import('pages/Login.vue'),
        meta: {
          auth: {
            access: false,
          },
        },
      },
    ],
  },
  {
    path: '/account',
    component: () => import('layouts/Auth.vue'),
    meta: {
      auth: {
        access: true,
      },
    },
    children: [
      {
        path: '',
        component: () => import('pages/Account.vue'),
      },
      {
        path: 'settings',
        component: () => import('pages/Settings.vue'),
        meta: {
          auth: {
            access: false,
          },
        },
      },
    ],
  },
];
```
In the example above, the */login* route will be closed to authorized users.
A route */account* will be closed to unauthorized users,
but the route */account* */settings* will be open to unauthorized users and closed to authorized users.

#### Using roles:
```js
import { middleware } from 'vue-router-auth';
import auth from 'auth-module'; // for example

const options = {
  router,
  guard: ({ auth }) => auth.user.role, // "admin"
  routes: {
    admin: '/route-for-not-admin',
  },
  context: {
    auth,
  },
};

router.beforeEach(middleware(options));
```
```js
const routes = [
  // ...
  {
    path: '/account',
    component: () => import('layouts/Auth.vue'),
    children: [
      {
        path: 'payments',
        component: () => import('pages/Account.vue'),
        meta: {
          auth: {
            access: 'simple-role',
            redirect: '/any-route',
          },
        },
      },
      {
        path: 'settings',
        component: () => import('pages/Settings.vue'),
        meta: {
          auth: {
            access: 'admin',
          },
        },
      },
    ],
  },
];
```

## :copyright: License

[MIT](http://opensource.org/licenses/MIT)
