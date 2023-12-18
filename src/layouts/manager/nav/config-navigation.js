// routes
import { PATH_MANAGER } from '../../../routes/paths';
// components
import SvgColor from '../../../components/svg-color';
import { useAuthContext } from 'src/auth/useAuthContext';
import { useEffect } from 'react';
import { apiManager } from 'src/utils/api-manager';
import { useState } from 'react';
import { useSettingsContext } from 'src/components/settings';
import { operatorLevelList } from 'src/utils/format';

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

  const { themeDnsData } = useSettingsContext();
  const { user } = useAuthContext();

  const [operatorList, setOperatorList] = useState([]);
  const isDeveloper = () => {
    return user?.level >= 50
  }
  const isManager = () => {
    return user?.level >= 40
  }
  useEffect(() => {
    settingSidebar();
  }, [])
  const settingSidebar = async () => {

    let operator_list = [];
    for (var i = 5; i >= 0; i--) {
      if (themeDnsData?.level_obj[`is_use_sales${i}`] == 1) {
        console.log(operatorLevelList[5 - i])
        operator_list.push({
          title: `${themeDnsData?.level_obj[`sales${i}_name`]}관리`,
          path: PATH_MANAGER.operator.list + `/${operatorLevelList[5 - i].value}`,
        },)
      }
    }
    console.log(operator_list)
    setOperatorList(operator_list);

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
        { title: '결제내역', path: PATH_MANAGER.deposit.list, icon: ICONS.user },
      ],
    },
    {
      items: [
        {
          title: '모계좌관리',
          path: PATH_MANAGER.motherAccount.root,
          icon: ICONS.user,
          children: [
            { title: '모계좌내역', path: PATH_MANAGER.motherAccount.list },
            { title: '모계좌출금요청', path: PATH_MANAGER.motherAccount.add },
          ],
        },
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
    ...((operatorList && operatorList?.length > 0 && isManager()) ? [{
      items: [
        {
          title: '영업자관리',
          path: PATH_MANAGER.operator.root,
          icon: ICONS.user,
          children: [
            ...operatorList,
            { title: '영업자추가', path: PATH_MANAGER.operator.add },
          ],
        },
      ],
    }] : []),
    {
      items: [
        {
          title: '가맹점관리',
          path: PATH_MANAGER.merchandise.root,
          icon: ICONS.user,
          children: [
            { title: '가맹점관리', path: PATH_MANAGER.merchandise.list },
            { title: '가맹점추가', path: PATH_MANAGER.merchandise.add },
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
