import { Card, Chip, Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerTable from "src/views/manager/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";

import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager } from "src/utils/api-manager";
import { useAuthContext } from "src/auth/useAuthContext";
import { Row } from "src/components/elements/styled-components";
import { commarNumber, returnMoment } from "src/utils/function";
const LogList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const defaultColumns = [
    {
      id: 'user_id',
      label: '회원No.',
      action: (row, is_excel) => {
        return row['user_id'] ?? "---"
      }
    },
    {
      id: 'user_name',
      label: '회원아이디',
      action: (row, is_excel) => {
        return row['user_name'] ?? "---"
      }
    },
    {
      id: 'result',
      label: 'RESULT',
      action: (row, is_excel) => {
        if (is_excel) {
          return row['response_result']
        }
        let color = 'error';
        if (searchObj?.type == 'back') {
          color = row['response_result'] > 0 ? 'secondary' : 'error'
        } else if (searchObj?.type == 'noti') {
          color = row['response_result'] == '0000' ? 'secondary' : 'error'
        }
        return <>
          <Chip label={row['response_result'] ?? "---"} color={color} />
        </>
      }
    },
    {
      id: 'method',
      label: 'METHOD',
      action: (row, is_excel) => {
        let request = JSON.parse(row?.request ?? "{}");
        return request['method'] ?? "---"
      }
    },
    {
      id: 'url',
      label: 'URL',
      action: (row, is_excel) => {
        let request = JSON.parse(row?.request ?? "{}");
        return request['url'] ?? "---"
      }
    },
    {
      id: 'request_data',
      label: 'REQUEST DATA',
      action: (row, is_excel) => {
        let request = JSON.parse(row?.request ?? "{}");

        if (is_excel) {
          return `query: ${JSON.stringify(request?.query)}\nparams: ${JSON.stringify(request?.params)}\nbody: ${JSON.stringify(request?.body)}`
        }
        let tooltip = <>
          <div>{`query: ${JSON.stringify(request?.query)}`}</div>
          <div>{`params: ${JSON.stringify(request?.params)}`}</div>
          <div>{`body: ${JSON.stringify(request?.body)}`}</div>
        </>;
        return <>
          <Tooltip title={tooltip}>
            <IconButton>
              <Icon icon={'charm:info'} />
            </IconButton>
          </Tooltip>
        </>
      }
    },
    {
      id: 'response_message',
      label: 'RESULT MESSAGE',
      action: (row, is_excel) => {
        return row['response_message'] ?? "---"
      }
    },
    {
      id: 'response_data',
      label: 'RESULT DATA',
      action: (row, is_excel) => {
        if (is_excel) {
          return row?.response_data
        }
        return <>
          <Tooltip title={row?.response_data}>
            <IconButton>
              <Icon icon={'charm:info'} />
            </IconButton>
          </Tooltip>
        </>
      }
    },
    {
      id: 'ip',
      label: 'IP',
      action: (row, is_excel) => {
        return row['request_ip'] ?? "---"
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
            {user?.level >= 50 &&
              <>
                <IconButton onClick={() => {
                  setModal({
                    func: () => { deleteLog(row?.id) },
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

  const [data, setData] = useState({});
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 20,
    dt: returnMoment().substring(0, 10),
    search: '',
    type: 'back'
  })
  useEffect(() => {
    pageSetting();
  }, [])
  const pageSetting = () => {

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
    let data_ = await apiManager('logs', 'list', obj);
    if (data_) {
      setData(data_);
    }
  }
  const deleteLog = async (id) => {
    let data = await apiManager('logs', 'delete', { id });
    if (data) {
      onChangePage(searchObj);
    }
  }

  return (
    <>
      <Stack spacing={3}>
        <Card>
          <Row style={{ padding: '12px', columnGap: '0.5rem' }}>
            <FormControl
              size="small"
            >
              <InputLabel>result 타입</InputLabel>
              <Select
                style={{ flexGrow: 1, width: '200px' }}
                label='result 타입'
                value={searchObj?.response_result_type}
                onChange={(e) => {
                  onChangePage({ ...searchObj, response_result_type: e.target.value })
                }}>
                <MenuItem value={null}>{'전체'}</MenuItem>
                <MenuItem value={1}>{'성공'} ({data?.success && (data?.success[0]?.success ?? 0)})</MenuItem>
                <MenuItem value={2}>{'실패'} ({data?.fail && (data?.fail[0]?.fail ?? 0)})</MenuItem>
              </Select>
            </FormControl>
            <FormControl
              size="small"
            >
              <InputLabel>api 타입</InputLabel>
              <Select
                style={{ flexGrow: 1, width: '200px' }}
                label='api 타입'
                value={searchObj?.type}
                onChange={(e) => {
                  onChangePage({ ...searchObj, type: e.target.value })
                }}>
                <MenuItem value={'back'}>{'백오피스'}</MenuItem>
                <MenuItem value={'noti'}>{'노티'}</MenuItem>
                <MenuItem value={'api'}>{'API'}</MenuItem>
              </Select>
            </FormControl>
          </Row>
          <Divider />
          <ManagerTable
            data={data}
            columns={defaultColumns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={''}
            head_columns={[]}
            table={'logs'}
            column_table={'logs'}
            excel_name={'로그'}
            is_one_date={true}
            between_content={<Row style={{ padding: '12px', columnGap: '0.5rem', flexWrap: 'wrap', rowGap: '0.5rem' }}>
              {data?.content &&
                <>
                  <Row style={{ alignItems: 'center', columnGap: '0.25rem' }}>
                    <Typography variant="body2">조회건수</Typography>
                    <Typography variant="subtitle2">{commarNumber(data?.total)}</Typography>
                  </Row>
                </>}
            </Row>}
          />
        </Card>
      </Stack>
    </>
  )
}
LogList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default LogList
