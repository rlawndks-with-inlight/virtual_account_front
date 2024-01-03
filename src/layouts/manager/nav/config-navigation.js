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
import { Icon } from '@iconify/react';

// ----------------------------------------------------------------------

const icon = (name) => (
  < SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
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
        operator_list.push({
          title: `${themeDnsData?.level_obj[`sales${i}_name`]}관리`,
          path: PATH_MANAGER.operator.list + `/${operatorLevelList[5 - i].value}`,
        },)
      }
    }
    setOperatorList(operator_list);

  }
  return [
    // GENERAL
    // ----------------------------------------------------------------------
    // {
    //   items: [
    //     { title: '대시보드', path: PATH_MANAGER.dashboards, icon: ICONS.dashboard },
    //   ],
    // },
    {
      items: [
        { title: '결제내역', path: PATH_MANAGER.deposit.list, icon: <Icon icon='iconamoon:history-fill' style={{ fontSize: '1.5rem' }} /> },
      ],
    },
    ...(isManager() ? [
      {
        items: [
          {
            title: '모계좌관리',
            path: PATH_MANAGER.motherAccount.root,
            icon: <Icon icon='tabler:affiliate' style={{ fontSize: '1.5rem' }} />,
            children: [
              { title: '모계좌내역', path: PATH_MANAGER.motherAccount.list },
              { title: '모계좌출금요청', path: PATH_MANAGER.motherAccount.request },
            ],
          },
        ],
      },
    ] : []),
    {
      items: [
        {
          title: '출금관리',
          path: PATH_MANAGER.withdraw.root,
          icon: <Icon icon='bx:money-withdraw' style={{ fontSize: '1.5rem' }} />,
          children: [
            { title: '출금내역', path: PATH_MANAGER.withdraw.list },
            ...(!isManager() ? [{ title: '출금요청', path: PATH_MANAGER.withdraw.request }] : []),
            ...(!isManager() ? [{ title: '반환요청', path: PATH_MANAGER.withdraw.return }] : []),
          ],
        },
      ],
    },
    {
      items: [
        {
          title: '보유정산금관리',
          path: PATH_MANAGER.settle.root,
          icon: <Icon icon='mdi:graph-line' style={{ fontSize: '1.5rem' }} />,
          children: [
            { title: '보유정산금내역', path: PATH_MANAGER.settle.list },
          ],
        },
      ],
    },
    ...((operatorList && operatorList?.length > 0 && isManager()) ? [{
      items: [
        {
          title: '영업자관리',
          path: PATH_MANAGER.operator.root,
          icon: <Icon icon='icon-park-outline:sales-report' style={{ fontSize: '1.5rem' }} />,
          children: [
            ...operatorList,
            { title: '영업자추가', path: PATH_MANAGER.operator.add },
          ],
        },
      ],
    }] : []),
    ...(isManager() ? [
      {
        items: [
          {
            title: '가맹점관리',
            path: PATH_MANAGER.merchandise.root,
            icon: <Icon icon='tabler:map-pin' style={{ fontSize: '1.5rem' }} />,
            children: [
              { title: '가맹점관리', path: PATH_MANAGER.merchandise.list },
              { title: '가맹점추가', path: PATH_MANAGER.merchandise.add },
            ],
          },
        ],
      },
    ] : []),
    {
      items: [
        {
          title: '가상계좌관리',
          path: PATH_MANAGER.virtualAccount.root,
          icon: <Icon icon='mdi:cloud-key-outline' style={{ fontSize: '1.5rem' }} />,
          children: [
            { title: '가상계좌관리', path: PATH_MANAGER.virtualAccount.list },
            { title: '가상계좌발급', path: PATH_MANAGER.virtualAccount.add },
          ],
        },
      ],
    },
    ...(isManager() ? [
      {
        items: [
          {
            title: '설정관리',
            path: PATH_MANAGER.brand.root,
            icon: <Icon icon='uil:setting' style={{ fontSize: '1.5rem' }} />,
            children: [
              { title: '기본설정', path: PATH_MANAGER.brand.edit },
              ...(isDeveloper() ? [{
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
            icon: <Icon icon='mdi:math-log' style={{ fontSize: '1.5rem' }} />,
            children: [
              { title: '로그관리', path: PATH_MANAGER.log.list },
            ],
          },
        ],
      },
    ] : []),
    {
      items: [
        { title: '가상계좌API', path: PATH_MANAGER.virtualAccountApi, icon: <Icon icon='ant-design:api-outlined' style={{ fontSize: '1.5rem' }} /> },
      ],
    },
  ];
}

export default navConfig;
