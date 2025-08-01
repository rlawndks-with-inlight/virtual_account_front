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
const navConfig = (is_show_all) => {

  const { themeDnsData } = useSettingsContext();
  const { user } = useAuthContext();

  const [operatorList, setOperatorList] = useState([]);
  const isDeveloper = () => {
    return user?.level >= 50
  }
  const isManager = () => {
    return user?.level >= 40
  }
  const isOperator = () => {
    return user?.level < 40 && user?.level > 10
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
  const isShowTab = (id) => {
    if (is_show_all) {
      return true;
    }
    if (themeDnsData?.setting_obj[`is_not_show_tab_${id}`] == 1) {
      return false;
    }
    return true;
  }
  return [
    // GENERAL
    // ----------------------------------------------------------------------
    ...(isShowTab('dashboards') ? [
      {
        id: 'dashboards',
        items: [
          { title: '대시보드', path: PATH_MANAGER.dashboards, icon: ICONS.dashboard },
        ],
      },
    ] : []),
    ...((themeDnsData?.setting_obj?.is_use_deposit == 1 && isShowTab('deposit')) ? [
      {
        id: 'deposit',
        items: [
          { title: '결제내역', path: PATH_MANAGER.deposit.list, icon: <Icon icon='iconamoon:history-fill' style={{ fontSize: '1.5rem' }} /> },
        ],
      },
    ] : []),
    ...((isManager() && themeDnsData?.setting_obj?.is_use_deposit == 1 && isShowTab('motherAccount')) ? [
      {
        id: 'motherAccount',
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
    ...(isShowTab('withdraw') ? [
      {
        id: 'withdraw',
        items: [
          {
            title: '출금관리',
            path: PATH_MANAGER.withdraw.root,
            icon: <Icon icon='bx:money-withdraw' style={{ fontSize: '1.5rem' }} />,
            children: [
              { title: '출금내역', path: PATH_MANAGER.withdraw.list },
              ...((!isManager()) ? [{ title: '출금요청', path: PATH_MANAGER.withdraw.request }] : []),
              ...((!isManager() && !isOperator() && user?.can_return == 1) ? [{ title: '반환요청', path: PATH_MANAGER.withdraw.return }] : []),
              ...((isManager() && themeDnsData?.withdraw_corp_type == 6) ? [{ title: '예금주조회', path: PATH_MANAGER.withdraw.check }] : []),
            ],
          },
        ],
      },
    ] : []),
    ...(isShowTab('settle') ? [
      {
        id: 'settle',
        items: [
          {
            title: '보유정산금관리',
            path: PATH_MANAGER.settle.root,
            icon: <Icon icon='mdi:graph-line' style={{ fontSize: '1.5rem' }} />,
            children: [
              { title: '보유정산금내역', path: PATH_MANAGER.settle.list },
              ...((!isManager()) ? [{ title: '보유정산금요청', path: PATH_MANAGER.settle.request },] : []),
              { title: '보유정산금요청내역', path: PATH_MANAGER.settle.requestList },
            ],
          },
        ],
      },
    ] : []),
    ...((operatorList && operatorList?.length > 0 && isManager() && isShowTab('operator')) ? [{
      id: 'operator',
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
    ...(((isManager() || isOperator()) && isShowTab('merchandise')) ? [
      {
        id: 'merchandise',
        items: [
          {
            title: '가맹점관리',
            path: PATH_MANAGER.merchandise.root,
            icon: <Icon icon='tabler:map-pin' style={{ fontSize: '1.5rem' }} />,
            children: [
              { title: '가맹점관리', path: PATH_MANAGER.merchandise.list },
              ...(isManager() ? [
                { title: '가맹점추가', path: PATH_MANAGER.merchandise.add },
              ] : []),
            ],
          },
        ],
      },
    ] : []),
    ...((!isOperator() && (themeDnsData?.withdraw_type == 0 || themeDnsData?.withdraw_corp_type == 6 || themeDnsData?.withdraw_corp_type == 8) && themeDnsData?.deposit_type == 'virtual_account' && isShowTab('virtualAccount')) ? [
      {
        id: 'virtualAccount',
        items: [
          {
            title: '가상계좌관리',
            path: PATH_MANAGER.virtualAccount.root,
            icon: <Icon icon='mdi:cloud-key-outline' style={{ fontSize: '1.5rem' }} />,
            children: [
              { title: '가상계좌관리', path: PATH_MANAGER.virtualAccount.list },
              // { title: '가상계좌발급', path: PATH_MANAGER.virtualAccount.add },
            ],
          },
        ],
      },
    ] : []),
    ...((!isOperator() && themeDnsData?.withdraw_type == 0 && themeDnsData?.deposit_type == 'gift_card' && isShowTab('giftCardMember')) ? [
      {
        id: 'giftCardMember',
        items: [
          {
            title: '상품권회원관리',
            path: PATH_MANAGER.giftCard.member.root,
            icon: <Icon icon='ph:gift' style={{ fontSize: '1.5rem' }} />,
            children: [
              { title: '상품권회원관리', path: PATH_MANAGER.giftCard.member.list },
              { title: '상품권회원발급', path: PATH_MANAGER.giftCard.member.add },
            ],
          },
        ],
      },
    ] : []),
    ...((isManager() && themeDnsData?.is_use_corp_account == 1 && isShowTab('corpAccount')) ? [
      {
        id: 'corpAccount',
        items: [
          {
            title: '법인통장관리',
            path: PATH_MANAGER.corpAccount.root,
            icon: <Icon icon='ic:baseline-corporate-fare' style={{ fontSize: '1.5rem' }} />,
            children: [
              { title: '법인통장관리', path: PATH_MANAGER.corpAccount.list },
              { title: '법인통장추가', path: PATH_MANAGER.corpAccount.add },
            ],
          },
        ],
      },
    ] : []),
    ...((isManager() && themeDnsData?.is_use_corp_account == 1 && isShowTab('depositAccount')) ? [
      {
        id: 'depositAccount',
        items: [
          {
            title: '입금통장관리',
            path: PATH_MANAGER.depositAccount.root,
            icon: <Icon icon='vaadin:money-deposit' style={{ fontSize: '1.5rem' }} />,
            children: [
              { title: '입금통장관리', path: PATH_MANAGER.depositAccount.list },
              { title: '입금통장추가', path: PATH_MANAGER.depositAccount.add },
            ],
          },
        ],
      },
    ] : []),
    ...(isShowTab('myPage') ? [
      {
        id: 'myPage',
        items: [
          {
            title: '마이페이지',
            path: PATH_MANAGER.myPage.root,
            icon: <Icon icon='f7:person' style={{ fontSize: '1.5rem' }} />,
            children: [
              { title: '비밀번호 변경', path: PATH_MANAGER.myPage.changePw },
            ],
          },
        ],
      },
    ] : []),
    ...((isShowTab('blackList') && !isOperator()) ? [
      {
        id: 'blackList',
        items: [
          {
            title: '블랙리스트관리',
            path: PATH_MANAGER.blackList.root,
            icon: <Icon icon='fluent:people-prohibited-16-regular' style={{ fontSize: '1.5rem' }} />,
            children: [
              { title: '블랙리스트관리', path: PATH_MANAGER.blackList.root },
              { title: '블랙리스트추가', path: PATH_MANAGER.blackList.add },
            ],
          },
        ],
      },
    ] : []),
    ...((!isOperator() && isShowTab('phoneAuthHistory') && themeDnsData?.setting_obj?.is_use_auth == 1) ? [
      {
        id: 'phoneAuthHistory',
        items: [
          {
            title: '인증관리',
            path: PATH_MANAGER.phoneAuthHistory.root,
            icon: <Icon icon='fluent:phone-12-regular' style={{ fontSize: '1.5rem' }} />,
            children: [
              { title: '인증관리', path: PATH_MANAGER.phoneAuthHistory.list },
            ],
          },
        ],
      },
    ] : []),
    ...((isManager() && isShowTab('brand')) ? [
      {
        id: 'brand',
        items: [
          {
            title: '설정관리',
            path: PATH_MANAGER.brand.root,
            icon: <Icon icon='uil:setting' style={{ fontSize: '1.5rem' }} />,
            children: [
              { title: '기본설정', path: PATH_MANAGER.brand.edit },
              { title: '브랜드관리', path: PATH_MANAGER.brand.list },
              ...(isDeveloper() ? [
                { title: '본사계정관리', path: PATH_MANAGER.brand.managers },
                { title: '비용지출내역', path: PATH_MANAGER.brand.payList },
              ] : []),
            ],
          },
        ],
      },
    ] : []),
    ...((isDeveloper() && isShowTab('log')) ? [
      {
        id: 'log',
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
    ...((isManager() && isShowTab('bulkUpload') && themeDnsData?.setting_obj?.is_use_bulk_upload == 1) ? [
      {
        id: 'bulkUpload',
        items: [
          {
            title: '대량등록',
            path: PATH_MANAGER.bulkUpload.root,
            icon: <Icon icon={'icon-park-outline:excel'} style={{ fontSize: '1.5rem' }} />,
            children: [
              { title: '대량등록', path: PATH_MANAGER.bulkUpload.upload },
            ],
          },
        ],
      },
    ] : []),
    ...((!isOperator() && isShowTab('api')) ? [
      {
        id: 'api',
        items: [
          { title: 'API', path: PATH_MANAGER.api, icon: <Icon icon='ant-design:api-outlined' style={{ fontSize: '1.5rem' }} /> },
        ],
      },
    ] : []),
    ...((isDeveloper() && isShowTab('git')) ? [
      {
        id: 'git',
        items: [
          { title: '깃허브푸시', path: PATH_MANAGER.git.commit, icon: <Icon icon='teenyicons:git-outline' style={{ fontSize: '1.5rem' }} /> },
        ],
      },
    ] : []),
  ];
}

export default navConfig;
