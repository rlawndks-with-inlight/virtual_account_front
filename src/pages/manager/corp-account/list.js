import { Avatar, Button, Card, CardContent, Chip, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, IconButton, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerTable from "src/views/manager/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Col, Row } from "src/components/elements/styled-components";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager } from "src/utils/api-manager";
import { useAuthContext } from "src/auth/useAuthContext";
import _ from "lodash";
import { bankCodeList, operatorLevelList, virtualAccountStatusList } from "src/utils/format";
import { useSettingsContext } from "src/components/settings";

const CorpAccountList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const defaultColumns = [
    {
      id: 'bank_code',
      label: '은행',
      action: (row, is_excel) => {
        return _.find(bankCodeList(), { value: row['bank_code'] })?.label
      }
    },
    {
      id: 'acct_num',
      label: '계좌번호',
      action: (row, is_excel) => {
        return row['acct_num']
      }
    },
    {
      id: 'acct_name',
      label: '예금주명',
      action: (row, is_excel) => {
        return row['acct_name']
      }
    },
    {
      id: 'created_at',
      label: '생성일',
      action: (row, is_excel) => {
        return row['created_at'] ?? "---"
      }
    },
    ...(user?.level >= 40 ? [
      {
        id: 'delete',
        label: '삭제',
        action: (row, is_excel) => {
          if (is_excel) {
            return `---`
          }
          if (row?.is_delete == 1) {
            return "---";
          }
          return (
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
            </>
          )
        }
      },
    ] : []),
  ]
  const router = useRouter();
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState({});
  const [operUserList, setOperUserList] = useState([]);
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 20,
    s_dt: '',
    e_dt: '',
    search: '',
    is_sales_man: true,
  })
  const [dialogObj, setDialogObj] = useState({
    changePassword: false,
  })
  const [changePasswordObj, setChangePasswordObj] = useState({
    id: '',
    user_pw: ''
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
    let data_ = await apiManager('corp-accounts', 'list', obj);
    if (data_) {
      setData(data_);
    }
  }
  const deleteItem = async (id) => {
    let data = await apiManager('corp-accounts', 'delete', { id });
    if (data) {
      onChangePage(searchObj);
    }
  }

  return (
    <>
      <Stack spacing={3}>
        <Card>
          <ManagerTable
            data={data}
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={'법인통장 추가'}
            head_columns={[]}
            table={'corp-accounts'}
            column_table={'corp_accounts'}
            excel_name={'법인통장'}
          />
        </Card>
      </Stack>
    </>
  )
}
CorpAccountList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default CorpAccountList
