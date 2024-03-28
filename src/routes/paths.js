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
  api: path(ROOTS_MANAGER, '/api'),
  brand: {
    root: path(ROOTS_MANAGER, '/brand'),
    edit: path(ROOTS_MANAGER, '/brand/edit'),
    list: path(ROOTS_MANAGER, '/brand/list'),
    payList: path(ROOTS_MANAGER, '/brand/pay-list'),
    shopDesign: path(ROOTS_MANAGER, '/brand/shop-design'),
    managers: path(ROOTS_MANAGER, '/brand/manager/list'),
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
    request: path(ROOTS_MANAGER, '/withdraw/request'),
    return: path(ROOTS_MANAGER, '/withdraw/return'),
  },
  settle: {
    root: path(ROOTS_MANAGER, '/settle'),
    list: path(ROOTS_MANAGER, '/settle/list'),
    request: path(ROOTS_MANAGER, '/settle/request'),
    requestList: path(ROOTS_MANAGER, '/settle/request-list'),
  },
  virtualAccount: {
    root: path(ROOTS_MANAGER, '/virtual-account'),
    list: path(ROOTS_MANAGER, '/virtual-account/list'),
    add: path(ROOTS_MANAGER, '/virtual-account/add'),
  },
  motherAccount: {
    root: path(ROOTS_MANAGER, '/mother-account'),
    list: path(ROOTS_MANAGER, '/mother-account/list'),
    add: path(ROOTS_MANAGER, '/mother-account/add'),
    request: path(ROOTS_MANAGER, '/mother-account/request'),
  },
  corpAccount: {
    root: path(ROOTS_MANAGER, '/corp-account'),
    list: path(ROOTS_MANAGER, '/corp-account/list'),
    add: path(ROOTS_MANAGER, '/corp-account/add'),
  },
  bulkUpload: {
    root: path(ROOTS_MANAGER, '/bulk-upload'),
    upload: path(ROOTS_MANAGER, '/bulk-upload/upload'),
  },
  log: {
    root: path(ROOTS_MANAGER, '/log'),
    list: path(ROOTS_MANAGER, '/log/list'),
  },
  git: {
    root: path(ROOTS_MANAGER, '/git'),
    commit: path(ROOTS_MANAGER, '/git/commit'),
  },
  myPage: {
    root: path(ROOTS_MANAGER, '/my-page'),
    changePw: path(ROOTS_MANAGER, '/my-page/change-pw'),
  },
};
