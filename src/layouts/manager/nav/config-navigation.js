// routes
import { PATH_MANAGER } from '../../../routes/paths';
// components
import SvgColor from '../../../components/svg-color';
import { useAuthContext } from 'src/auth/useAuthContext';
import { useEffect } from 'react';
import { apiManager } from 'src/utils/api-manager';
import { useState } from 'react';

// ----------------------------------------------------------------------

const icon = (name) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  user: icon('ic_user'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
};
const navConfig = () => {
  const { user } = useAuthContext();

  const [productCategoryList, setProductCategoryList] = useState([]);
  const isDeveloper = () => {
    return user?.level >= 50
  }
  useEffect(() => {
    settingSidebar();
  }, [])

  const settingSidebar = async () => {
    let product_category_list = await apiManager('product-categories', 'list');
    setProductCategoryList(product_category_list?.content ?? []);

  }
  return [
    // GENERAL
    // ----------------------------------------------------------------------
    {
      items: [
        { title: '대시보드', path: PATH_MANAGER.dashboards, icon: ICONS.dashboard },
      ],
    },
    {
      items: [
        {
          title: '출금관리',
          path: PATH_MANAGER.withdraw.root,
          icon: ICONS.user,
          children: [
            { title: '출금내역', path: PATH_MANAGER.withdraw.list },
            { title: '출금요청', path: PATH_MANAGER.withdraw.add },
            { title: '반환요청', path: PATH_MANAGER.withdraw.return },
          ],
        },
      ],
    },
    {
      items: [
        {
          title: '영업자관리',
          path: PATH_MANAGER.operator.root,
          icon: ICONS.user,
          children: [
            { title: '영업자관리', path: PATH_MANAGER.operator.list },
            { title: '영업자추가', path: PATH_MANAGER.operator.add },
          ],
        },
      ],
    },
    {
      items: [
        {
          title: '대리점관리',
          path: PATH_MANAGER.merchandise.root,
          icon: ICONS.user,
          children: [
            { title: '대리점관리', path: PATH_MANAGER.merchandise.list },
            { title: '대리점추가', path: PATH_MANAGER.merchandise.add },
          ],
        },
      ],
    },
    {
      items: [
        {
          title: '가상계좌관리',
          path: PATH_MANAGER.virtualAccount.root,
          icon: ICONS.user,
          children: [
            { title: '가상계좌관리', path: PATH_MANAGER.virtualAccount.list },
            { title: '가상계좌발급', path: PATH_MANAGER.virtualAccount.edit },
          ],
        },
      ],
    },
    ...(user?.level >= 40 ? [
      {
        items: [
          {
            title: '설정관리',
            path: PATH_MANAGER.brand.root,
            icon: ICONS.user,
            children: [
              { title: '기본설정', path: PATH_MANAGER.brand.edit },
              ...(user?.level >= 50 ? [{
                title: '브랜드관리', path: PATH_MANAGER.brand.list
              }] : []),
            ],
          },
        ],
      },
    ] : []),
    ...(isDeveloper() ? [
      {
        items: [
          {
            title: '로그관리',
            path: PATH_MANAGER.log.root,
            icon: ICONS.user,
            children: [
              { title: '로그관리', path: PATH_MANAGER.log.list },
            ],
          },
        ],
      },
    ] : [])
  ];
}

export default navConfig;
