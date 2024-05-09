import { Card, Chip, Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerTable from "src/views/manager/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";

import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager } from "src/utils/api-manager";
import { useAuthContext } from "src/auth/useAuthContext";
import { Row } from "src/components/elements/styled-components";
import _ from "lodash";
import { bankCodeList } from "src/utils/format";

const BlackList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const defaultColumns = [
    {
      id: 'user_name',
      label: '가맹점',
      action: (row, is_excel) => {
        if (is_excel) {
          return `${row[`nickname`]} (${row['user_name']})`
        }
        let text = row['user_name'] ? `${row[`nickname`]}\n(${row['user_name']})` : "---";
        return <div style={{ whiteSpace: 'pre', cursor: `${user?.level >= 40 ? 'pointer' : ''}` }} onClick={() => {
          if (user?.level >= 40) {
            setDialogObj({
              connectMcht: true,
              virtual_account_id: row?.id,
            })
          }
        }}>{text}</div>
      }
    },
    {
      id: 'acct_name',
      label: '고객명',
      action: (row, is_excel) => {
        return row['acct_name'] ?? "---"
      }
    },
    {
      id: 'bank_code',
      label: '은행',
      action: (row, is_excel) => {
        return _.find(bankCodeList(), { value: row['bank_code'] })?.label ?? "---"
      }
    },
    {
      id: 'acct_num',
      label: '계좌번호',
      action: (row, is_excel) => {
        return row['acct_num'] ?? "---"
      }
    },
    {
      id: 'created_at',
      label: '생성시간',
      action: (row, is_excel) => {
        return row['created_at'] ?? "---"
      }
    },
    {
      id: 'edit',
      label: `삭제`,
      action: (row, is_excel) => {
        if (is_excel) {
          return "---"
        }
        return (
          <>
            {user?.level >= 40 &&
              <>
                <IconButton onClick={() => {
                  setModal({
                    func: () => { deleteItem(row?.id) },
                    icon: 'material-symbols:delete-outline',
                    title: '정말 삭제하시겠습니까?'
                  })
                }}>
                  <Icon icon='material-symbols:delete-outline' />
                </IconButton>
              </>}
          </>
        )
      }
    },
  ]
  const router = useRouter();
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState({});
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 20,
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
    onChangePage({ ...searchObj, page: 1, });
  }
  const onChangePage = async (obj_) => {
    let obj = obj_;
    if (obj) {
      setSearchObj(obj);
    } else {
      obj = { ...searchObj };
    }
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiManager('black-lists', 'list', obj);
    if (data_) {
      setData(data_);
    }
  }
  const deleteItem = async (id) => {
    let data = await apiManager('black-lists', 'delete', { id });
    if (data) {
      onChangePage(searchObj);
    }
  }
  return (
    <>
      <Stack spacing={3}>
        <Card>
          <Row style={{ padding: '12px', columnGap: '0.5rem' }}>

          </Row>
          <Divider />
          <ManagerTable
            data={data}
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={'블랙리스트추가'}
            add_link={'/manager/black-lst/add'}
            head_columns={[]}
            table={'black-lists'}
            column_table={'black-lists'}
            excel_name={'블랙리스트'}
          />
        </Card>
      </Stack>
    </>
  )
}
BlackList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default BlackList
