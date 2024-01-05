import { Avatar, Button, Card, CardContent, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerTable from "src/views/manager/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Row } from "src/components/elements/styled-components";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager } from "src/utils/api-manager";
import { commarNumber, getUserFee, getUserLevelByNumber } from "src/utils/function";
import { useAuthContext } from "src/auth/useAuthContext";
import { useSettingsContext } from "src/components/settings";
import { bankCodeList, operatorLevelList } from "src/utils/format";
import _ from "lodash";
const DepositList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const defaultHeadColumns = [
    {
      title: '기본정보',
      count: 6,
    },
    {
      title: '유저정보',
      count: 4
    },

    {
      title: (user?.level >= 40 ? 3 : 0) + (themeDnsData?.operator_list.filter(el => user?.level >= el?.value)?.length ?? 0) * 4 > 0 ? '영업자정보' : '',
      count: (user?.level >= 40 ? 3 : 0) + (themeDnsData?.operator_list.filter(el => user?.level >= el?.value)?.length ?? 0) * 4
    },
  ]
  const defaultColumns = [
    {
      id: 'trx_id',
      label: '거래번호',
      action: (row, is_excel) => {
        return row['trx_id'] ?? "---"
      }
    },
    {
      id: 'mcht_nickname',
      label: '가맹점',
      action: (row, is_excel) => {
        return `${row[`mcht_nickname`]}\n(${row['mcht_user_name']})`
      }
    },
    {
      id: 'deposit_bank_code',
      label: '입금은행',
      action: (row, is_excel) => {
        return _.find(bankCodeList(), { value: row['deposit_bank_code'] })?.label
      }
    },
    {
      id: 'virtual_acct_num',
      label: '가상계좌번호',
      action: (row, is_excel) => {
        return row['virtual_acct_num'] ?? "---"
      }
    },
    // {
    //   id: 'user_name',
    //   label: '상태',
    //   action: (row, is_excel) => {
    //     return row['user_name'] ?? "---"
    //   }
    // },
    {
      id: 'amount_ago',
      label: '입금예정금액',
      action: (row, is_excel) => {
        return commarNumber(row['amount'])
      },
      sx: (row) => {
        return {
          color: 'green'
        }
      },
    },
    {
      id: 'amount',
      label: '실제입금금액',
      action: (row, is_excel) => {
        return commarNumber(row['amount'])
      },
      sx: (row) => {
        return {
          color: 'blue'
        }
      },
    },
    {
      id: 'mcht_amount',
      label: '가맹점 정산금액',
      action: (row, is_excel) => {
        return commarNumber(row['mcht_amount'])
      },
      sx: (row) => {
        return {
          color: '#a52a2a'
        }
      },
      sx: (row) => {
        return {
          color: 'red'
        }
      },
    },
    {
      id: 'deposit_fee',
      label: '입금수수료',
      action: (row, is_excel) => {
        return commarNumber(row['deposit_fee'])
      }
    },
    {
      id: 'mcht_fee',
      label: '가맹점 요율',
      action: (row, is_excel) => {
        return row['mcht_fee'] + '%'
      }
    },
    {
      id: 'mcht_fee',
      label: '가맹점 획득 요율',
      action: (row, is_excel) => {
        return parseFloat(getUserFee(row, 10, themeDnsData?.operator_list, themeDnsData?.head_office_fee)) + '%'
      }
    },
    ...(user?.level >= 40 ? [
      {
        id: 'head_office_fee',
        label: '본사 요율',
        action: (row, is_excel) => {
          return row['head_office_fee'] + '%'
        }
      },
      {
        id: `head_office_fee`,
        label: `본사 획득 요율`,
        action: (row, is_excel) => {
          return row[`head_office_fee`] > 0 ? parseFloat(getUserFee(row, 40, themeDnsData?.operator_list, themeDnsData?.head_office_fee)) + '%' : "---"
        }
      },
      {
        id: 'head_office_amount',
        label: '본사 수수료',
        action: (row, is_excel) => {
          return row['head_office_amount']
        },
        sx: (row) => {
          return {
            color: '#a52a2a'
          }
        },
      },
    ] : []),
    ...(themeDnsData?.operator_list ?? []).map(operator => {
      if (user?.level >= operator?.value) {
        return [
          {
            id: `sales${operator?.num}_id`,
            label: operator?.label,
            action: (row, is_excel) => {
              return row[`sales${operator?.num}_id`] > 0 ? <div style={{ textAlign: 'center' }}>{`${row[`sales${operator?.num}_nickname`]}\n(${row[`sales${operator?.num}_user_name`]})`}</div> : `---`
            }
          },
          {
            id: `sales${operator?.num}_fee`,
            label: `${operator?.label} 요율`,
            action: (row, is_excel) => {
              return row[`sales${operator?.num}_id`] > 0 ? row[`sales${operator?.num}_fee`] + '%' : "---"
            }
          },
          {
            id: `sales${operator?.num}_fee`,
            label: `${operator?.label} 획득 요율`,
            action: (row, is_excel) => {
              return row[`sales${operator?.num}_id`] > 0 ? parseFloat(getUserFee(row, operator?.value, themeDnsData?.operator_list, themeDnsData?.head_office_fee)) + '%' : "---"
            }
          },
          {
            id: `sales${operator?.num}_amount`,
            label: `${operator?.label} 수수료`,
            action: (row, is_excel) => {
              return row[`sales${operator?.num}_amount`] > 0 ? commarNumber(row[`sales${operator?.num}_amount`]) : "---"
            },
            sx: (row) => {
              return {
                color: '#a52a2a'
              }
            },
          },
        ]
      } else {
        return []
      }

    }).flat(),
    {
      id: 'created_at',
      label: '생성일',
      action: (row, is_excel) => {
        return row['created_at'] ?? "---"
      }
    },
  ]
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState({});
  const [operUserList, setOperUserList] = useState([]);
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 10,
    s_dt: '',
    e_dt: '',
    search: '',
  })

  useEffect(() => {
    pageSetting();
  }, [])
  const pageSetting = () => {
    let cols = defaultColumns;
    setColumns(cols)
    getAllOperUser();
    onChangePage({ ...searchObj, page: 1 });

  }
  const getAllOperUser = async () => {
    let data = await apiManager('users', 'list', {
      level_list: [10, ...operatorLevelList.map(itm => { return itm.value })],
    });
    setOperUserList(data?.content ?? []);
  }
  const onChangePage = async (obj) => {
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiManager('deposits', 'list', obj);
    if (data_) {
      setData(data_);
    }
    setSearchObj(obj);
  }

  return (
    <>
      <Stack spacing={3}>
        <Card>
          {user?.level >= 40 &&
            <>
              <Row style={{ padding: '12px', columnGap: '0.5rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
                {(themeDnsData?.operator_list ?? []).map(operator => {
                  return <FormControl variant='outlined' size='small' sx={{ minWidth: '150px' }}>
                    <InputLabel>{operator?.label}</InputLabel>
                    <Select label={operator?.label} value={searchObj[`sales${operator?.num}_id`]}
                      onChange={(e) => {
                        onChangePage({ ...searchObj, [`sales${operator?.num}_id`]: e.target.value, page: 1, })
                      }}>
                      <MenuItem value={null}>{operator?.label} 전체</MenuItem>
                      {operUserList.filter(el => el?.level == operator?.value).map(oper => {
                        return <MenuItem value={oper?.id}>{`${oper?.nickname}(${oper?.user_name})`}</MenuItem>
                      })}
                    </Select>
                  </FormControl>
                })}
                <FormControl variant='outlined' size='small' sx={{ minWidth: '150px' }}>
                  <InputLabel>가맹점</InputLabel>
                  <Select label='가맹점' value={searchObj[`mcht_id`]}
                    onChange={(e) => {
                      onChangePage({ ...searchObj, [`mcht_id`]: e.target.value, page: 1, })
                    }}>
                    <MenuItem value={null}>가맹점 전체</MenuItem>
                    {operUserList.filter(el => el?.level == 10).map(oper => {
                      return <MenuItem value={oper?.id}>{`${oper?.nickname}(${oper?.user_name})`}</MenuItem>
                    })}
                  </Select>
                </FormControl>
              </Row>
            </>}
          <ManagerTable
            data={data}
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            //add_button_text={user?.level >= 40 ? '결제내역추가' : ''}
            head_columns={defaultHeadColumns}
            table={'deposits'}
            excel_name={'출금'}
            between_content={<Row style={{ padding: '12px', columnGap: '0.5rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
              {data?.content &&
                <>
                  <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                    <Typography variant="body2">조회건수</Typography>
                    <Typography variant="subtitle2">{commarNumber(data?.total)}</Typography>
                  </Row>
                  <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                    <Typography variant="body2">입금예정금액</Typography>
                    <Typography variant="subtitle2">{commarNumber(data?.chart?.expect_amount)}원</Typography>
                  </Row>
                  <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                    <Typography variant="body2">실제입금금액</Typography>
                    <Typography variant="subtitle2">{commarNumber(data?.chart?.amount)}원</Typography>
                  </Row>
                  <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                    <Typography variant="body2">가맹점정산금액</Typography>
                    <Typography variant="subtitle2">{commarNumber(data?.chart?.mcht_amount)}원</Typography>
                  </Row>
                  {user?.level >= 40 &&
                    <>
                      <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                        <Typography variant="body2">본사수수료</Typography>
                        <Typography variant="subtitle2">{commarNumber(data?.chart?.head_office_amount)}원</Typography>
                      </Row>
                    </>}
                  {themeDnsData?.operator_list.map(oper => {
                    if (user?.level >= oper?.value) {
                      return <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                        <Typography variant="body2">{oper?.label}수수료</Typography>
                        <Typography variant="subtitle2">{commarNumber(data?.chart[`sales${oper?.num}_amount`])}원</Typography>
                      </Row>
                    }

                  })}
                  {user?.level >= 40 &&
                    <>
                      <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                        <Typography variant="body2">총 영업자 수수료</Typography>
                        <Typography variant="subtitle2">{commarNumber(_.sum(themeDnsData?.operator_list.map(oper => {
                          return data?.chart[`sales${oper?.num}_amount`]
                        })))}원</Typography>
                      </Row>
                    </>}
                  <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                    <Typography variant="body2">입금수수료</Typography>
                    <Typography variant="subtitle2">{commarNumber(data?.chart?.deposit_fee)}원</Typography>
                  </Row>
                </>}
            </Row>}
          />
        </Card>
      </Stack>
    </>
  )
}
DepositList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default DepositList
