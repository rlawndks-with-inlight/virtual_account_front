// ----------------------------------------------------------------------

function path(root, sublink) {
  return `${root}${sublink}`;
}

const ROOTS_MANAGER = '/manager';

// ----------------------------------------------------------------------

export const PATH_AUTH = {
  login: '/login',
};

export const PATH_MANAGER = {
  root: ROOTS_MANAGER,
  dashboards: path(ROOTS_MANAGER, '/dashboards'),
  brand: {
    root: path(ROOTS_MANAGER, '/brand'),
    edit: path(ROOTS_MANAGER, '/brand/edit'),
    list: path(ROOTS_MANAGER, '/brand/list'),
    shopDesign: path(ROOTS_MANAGER, '/brand/shop-design'),
  },
  merchandise: {
    root: path(ROOTS_MANAGER, '/merchandise'),
    list: path(ROOTS_MANAGER, '/merchandise/list'),
    add: path(ROOTS_MANAGER, '/merchandise/add'),
  },
  operator: {
    root: path(ROOTS_MANAGER, '/operator'),
    list: path(ROOTS_MANAGER, '/operator/list'),
    add: path(ROOTS_MANAGER, '/operator/add'),
  },
  deposit: {
    root: path(ROOTS_MANAGER, '/deposit'),
    list: path(ROOTS_MANAGER, '/deposit/list'),
    add: path(ROOTS_MANAGER, '/deposit/add'),
  },
  withdraw: {
    root: path(ROOTS_MANAGER, '/withdraw'),
    list: path(ROOTS_MANAGER, '/withdraw/list'),
    add: path(ROOTS_MANAGER, '/withdraw/add'),
    return: path(ROOTS_MANAGER, '/withdraw/return'),
  },
  virtualAccount: {
    root: path(ROOTS_MANAGER, '/virtual-account'),
    list: path(ROOTS_MANAGER, '/virtual-account/list'),
    edit: path(ROOTS_MANAGER, '/virtual-account/edit'),
  },
  motherAccount: {
    root: path(ROOTS_MANAGER, '/mother-account'),
    list: path(ROOTS_MANAGER, '/mother-account/list'),
    add: path(ROOTS_MANAGER, '/mother-account/add'),
  },
  log: {
    root: path(ROOTS_MANAGER, '/log'),
    list: path(ROOTS_MANAGER, '/log/list'),
  },
};
