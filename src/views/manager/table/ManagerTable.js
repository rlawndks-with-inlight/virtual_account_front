// @mui
import { Table, TableRow, TableBody, TableCell, TableContainer, Pagination, Divider, Box, TextField, Button, FormControl, InputLabel, OutlinedInput, InputAdornment, IconButton, CircularProgress, Tooltip, TableHead, Select, MenuItem, Dialog, DialogContentText, DialogContent, DialogTitle, FormControlLabel, Switch } from '@mui/material';
import { TableHeadCustom, TableNoData } from 'src/components/table';
import {
  DatePicker,
  StaticDatePicker,
  MobileDatePicker,
  DesktopDatePicker,
} from '@mui/x-date-pickers';
import { useEffect, useState } from 'react';
import { Row } from 'src/components/elements/styled-components';
import styled from 'styled-components';
import Scrollbar from 'src/components/scrollbar/Scrollbar';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';
import { styled as muiStyled } from '@mui/material';
import { useTheme } from '@emotion/react';
import { excelDownload, getTableIdDuplicate, returnMoment } from 'src/utils/function';
import { Spinner } from 'evergreen-ui';
import { apiManager } from 'src/utils/api-manager';
import { useSettingsContext } from 'src/components/settings';
// ----------------------------------------------------------------------
const TableHeaderContainer = styled.div`
padding: 0.75rem;
display: flex;
flex-wrap: wrap;
justify-content:space-between;
@media (max-width:1000px){
  flex-direction:column;
  row-gap:0.75rem;
}
`
const CustomTableRow = muiStyled(TableRow)(({ theme, index }) => ({
  background: `${index % 2 == 1 && theme.palette.mode == 'light' ? theme.palette.grey[200] : ''}`,
  '&:hover': {
    background: `${theme.palette.mode == 'dark' ? '' : theme.palette.grey[300]}`,
  },
}));

export default function ManagerTable(props) {
  const {
    columns,
    data,
    add_button_text,
    add_link,
    onChangePage,
    searchObj,
    head_columns = [],
    width,
    table,
    excel_name,
    between_content,
    middle_line_content,
    column_table,
    is_one_date
  } = props;
  const { page, page_size } = props?.searchObj;

  const router = useRouter();
  const theme = useTheme();

  const { themeNotShowColumns, onChangeNotShowColumns } = useSettingsContext();
  const [sDt, setSDt] = useState(searchObj?.s_dt ? new Date(searchObj?.s_dt) : undefined);
  const [eDt, setEDt] = useState(searchObj?.e_dt ? new Date(searchObj?.e_dt) : undefined);
  const [dt, setDt] = useState(new Date())
  const [keyword, setKeyWord] = useState("");
  const [zColumn, setZColumn] = useState([]);
  const [zHeadColumn, setZHeadColumn] = useState([]);
  const [openProcessColumns, setOpenProcessColumns] = useState(false);
  const [checked, setChecked] = useState('id')
  const [order, setOrder] = useState('desc')
  const [excelLoading, setExcelLoading] = useState(false);
  useEffect(() => {
    settingColumns();
  }, [columns, head_columns, router.asPath]);

  const settingColumns = async () => {
    try {
      let column_list = [...columns];
      let head_column_list = [...head_columns];
      setZColumn(column_list);
      setZHeadColumn(head_column_list);
    } catch (err) {
      console.log(err)
    }

  }
  const getMaxPage = (total = 0, page_size = 1) => {
    if (total == 0) {
      return 1;
    }
    if (total % parseInt(page_size) == 0) {
      return parseInt(total / parseInt(page_size));
    } else {
      return parseInt(total / parseInt(page_size)) + 1;
    }
  }
  if (!(zColumn.length > 0)) {
    return (
      <>

      </>
    )
  }
  const onClickDateButton = (num) => {
    let s_dt = 0;
    let e_dt = 0;

    if (num == 1) {
      s_dt = returnMoment().substring(0, 10);
      e_dt = returnMoment().substring(0, 10);
    } else if (num == -1) {
      s_dt = returnMoment(-1).substring(0, 10);
      e_dt = returnMoment(-1).substring(0, 10);
    } else if (num == 3) {
      s_dt = returnMoment(-3).substring(0, 10);
      e_dt = returnMoment(-1).substring(0, 10);
    } else if (num == 30) {
      let moment = returnMoment().substring(0, 10);
      moment = moment.split('-');
      if (moment[1] == '01') {
        moment[1] = '12';
        moment[0] = moment[0] - 1;
      } else {
        moment[1] = moment[1] - 1;
      }
      s_dt = `${moment[0]}-${moment[1] >= 10 ? moment[1] : `0${moment[1]}`}-01`;
      e_dt = returnMoment(undefined, new Date(moment[0], moment[1], 0)).substring(0, 10);
    }

    setSDt(new Date(s_dt));
    setEDt(new Date(e_dt));
    onChangePage({
      ...searchObj,
      s_dt: s_dt,
      e_dt: e_dt,
    })
  }
  const exportExcel = async () => {
    setExcelLoading(true);
    let data = await apiManager(table, 'list', { ...searchObj, page_size: 50000, is_excel: true, });
    let result = [];
    for (var i = 0; i < data.content.length; i++) {
      let col = data.content[i];
      result[i] = [];
      for (var j = 0; j < zColumn.length; j++) {
        let text = zColumn[j].action(col, true);
        result[i].push(text);
      }
    }
    await excelDownload(result, zColumn, excel_name);
    setExcelLoading(false);
  }
  const onSort = (e, prop) => {
    const isDesc = checked === prop && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc')
    setChecked(prop)
  }
  return (
    <>
      <Dialog open={openProcessColumns}
        onClose={() => {
          setOpenProcessColumns(false);
        }}
      >
        <DialogTitle>{`검색옵션 설정`}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            테이블에 노출할 컬럼들을 설정하세요.
          </DialogContentText>
          <Row style={{ flexWrap: 'wrap', padding: '1rem 0 1rem 0' }}>
            {columns.map((item, idx) => (
              <>
                <FormControlLabel control={<Switch checked={(themeNotShowColumns[column_table] ?? {})[item?.id] != 1} />} label={item?.label}
                  sx={{ width: '45%' }}
                  onChange={(e) => {
                    let table_columns = themeNotShowColumns[column_table] ?? {};
                    table_columns[item?.id] = e.target.checked ? 0 : 1;
                    onChangeNotShowColumns({
                      ...themeNotShowColumns,
                      [column_table]: table_columns,
                    })
                  }}
                />
              </>
            ))}
          </Row>
        </DialogContent>
      </Dialog>
      <TableContainer sx={{ overflow: 'unset' }}>
        <TableHeaderContainer>
          <Row style={{ rowGap: '1rem', flexWrap: 'wrap', columnGap: '0.75rem' }}>
            <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => setOpenProcessColumns(true)}>검색옵션</Button>
            {middle_line_content}
          </Row>
        </TableHeaderContainer>
        <TableHeaderContainer>
          <Row style={{ rowGap: '1rem', flexWrap: 'wrap', columnGap: '0.75rem' }}>
            {data.content &&
              <>
                {is_one_date ?
                  <>
                    <DesktopDatePicker
                      label="날짜 선택"
                      value={dt}
                      format='yyyy-MM-dd'
                      onChange={(newValue) => {
                        setDt(newValue);
                        onChangePage({ ...searchObj, dt: returnMoment(false, new Date(newValue)).substring(0, 10), page: 1 })
                      }}
                      renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                      sx={{ width: '180px', height: '32px' }}
                      slotProps={{ textField: { size: 'small' } }}
                    />
                  </>
                  :
                  <>
                    {window.innerWidth > 1000 ?
                      <>
                        <DesktopDatePicker
                          label="시작일 선택"
                          value={sDt}
                          format='yyyy-MM-dd'
                          onChange={(newValue) => {
                            setSDt(newValue);
                            onChangePage({ ...searchObj, s_dt: returnMoment(false, new Date(newValue)).substring(0, 10), page: 1 })
                          }}
                          renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                          sx={{ width: '150px', height: '32px' }}
                          slotProps={{ textField: { size: 'small' } }}
                        />
                        <DesktopDatePicker
                          label="종료일 선택"
                          value={eDt}
                          format='yyyy-MM-dd'
                          onChange={(newValue) => {
                            setEDt(newValue);
                            onChangePage({ ...searchObj, e_dt: returnMoment(false, new Date(newValue)).substring(0, 10), page: 1 })
                          }}
                          renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                          sx={{ width: '150px' }}
                          slotProps={{ textField: { size: 'small' } }}
                        />
                      </>
                      :
                      <>
                        <Row style={{ columnGap: '0.5rem' }}>
                          <MobileDatePicker
                            label="시작일 선택"
                            value={sDt}
                            format='yyyy-MM-dd'
                            onChange={(newValue) => {
                              setSDt(newValue);
                              onChangePage({ ...searchObj, s_dt: returnMoment(false, new Date(newValue)).substring(0, 10), page: 1 })
                            }}
                            renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                            sx={{ flexGrow: 1 }}
                            slotProps={{ textField: { size: 'small' } }}
                          />
                          <MobileDatePicker
                            label="종료일 선택"
                            value={eDt}
                            format='yyyy-MM-dd'
                            onChange={(newValue) => {
                              setEDt(newValue);
                              onChangePage({ ...searchObj, e_dt: returnMoment(false, new Date(newValue)).substring(0, 10), page: 1 })
                            }}
                            renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                            sx={{ flexGrow: 1 }}
                            slotProps={{ textField: { size: 'small' } }}
                          />
                        </Row>
                      </>}
                    <Row style={{ columnGap: '0.5rem' }}>
                      <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton(-1)}>어제</Button>
                      <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton(1)}>당일</Button>
                      <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton(3)}>3일전</Button>
                      <Button variant="outlined" sx={{ flexGrow: 1 }} onClick={() => onClickDateButton(30)}>1개월</Button>
                    </Row>
                  </>}

                <Button variant='outlined'
                  startIcon={<Icon icon={'icon-park-outline:excel'} />}
                  onClick={exportExcel}
                  disabled={excelLoading}
                >
                  {excelLoading ?
                    <>
                      <CircularProgress sx={{ margin: 'auto' }} size={20} />
                      <div>추출중입니다...</div>
                    </>
                    :
                    <>
                      엑셀추출
                    </>}
                </Button>
              </>}
          </Row>
          <Row style={{ columnGap: '0.75rem', flexWrap: 'wrap', rowGap: '0.7rem' }}>
            <FormControl variant='outlined' size='small' sx={{ width: '100px', marginLeft: 'auto' }}>
              <InputLabel>조회개수</InputLabel>
              <Select label='조회개수' value={page_size}
                onChange={(e) => {
                  onChangePage({ ...searchObj, page_size: e.target.value, page: 1, })
                }}>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={30}>30</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="outlined">
              <OutlinedInput
                size='small'
                label=''
                value={keyword}
                sx={{ maxWidth: '180px' }}
                endAdornment={<>
                  <Tooltip title='해당 텍스트로 검색하시려면 엔터 또는 돋보기 버튼을 클릭해주세요.'>
                    <IconButton position="end" sx={{ transform: 'translateX(14px)' }} onClick={() => onChangePage({ ...searchObj, search: keyword })}>
                      <Icon icon='material-symbols:search' />
                    </IconButton>
                  </Tooltip>

                </>}
                onChange={(e) => {
                  setKeyWord(e.target.value)
                }}
                onKeyPress={(e) => {
                  if (e.key == 'Enter') {
                    onChangePage({ ...searchObj, search: keyword, page: 1, })
                  }
                }}
              />
            </FormControl>
            {add_button_text ?
              <>
                <Button variant='contained' onClick={() => {
                  let path = router.asPath;
                  if (router.asPath.includes('list')) {
                    path = path.replace('list', '');
                  }
                  router.push(add_link || `${path}add`)
                }}>
                  + {add_button_text}
                </Button>
              </>
              :
              <>
              </>}
          </Row>
        </TableHeaderContainer>
        {between_content}
        <div style={{ width: '100%', overflow: 'auto' }}>
          {!data.content ?
            <>
              <Row style={{ height: '400px' }}>
                <CircularProgress sx={{ margin: 'auto' }} />
              </Row>
            </>
            :
            <>
              <Table sx={{ minWidth: 800, width: `${width ? width : '100%'}` }}>
                {zHeadColumn.length > 0 &&
                  <>
                    <TableHead>
                      <TableRow sx={{ padding: '0' }}>
                        {zHeadColumn.map((head, idx) => (
                          <>
                            <TableCell colSpan={head.count} sx={{ textAlign: 'center', paddingRight: '0', paddingLeft: '0', fontSize: '0.8rem', padding: '8px 0' }}>
                              <div style={{ borderRight: `1px solid #ccc` }}>
                                {head.title}
                              </div>
                            </TableCell>
                          </>
                        ))}
                        <TableCell colSpan={zColumn.length - zHeadColumn.length} sx={{ textAlign: 'center', paddingRight: '0', paddingLeft: '0' }} />
                      </TableRow>
                    </TableHead>
                  </>}
                <TableHeadCustom order={order} onSort={onSort} headLabel={zColumn} themeNotShowColumns={themeNotShowColumns} column_table={column_table} searchObj={searchObj} onChangePage={onChangePage} />
                <TableBody>
                  {data.content && data.content.map((row, index) => (
                    <CustomTableRow key={index} index={index} style={{}}>
                      {zColumn && zColumn.map((col, idx) => (
                        <>
                          {(themeNotShowColumns[column_table] ?? {})[col?.id] != 1 &&
                            <>
                              <TableCell align="left" sx={{ ...(col?.sx ? col.sx(row) : {}), fontSize: '0.75rem', padding: '4px 0' }}>
                                <Row style={{ alignItems: 'center' }}>
                                  <div style={{ borderLeft: `${idx != 0 ? '1px solid #ccc' : ''}`, paddingLeft: '8px', height: '1.5rem' }} />
                                  {col.action(row)}
                                  <div style={{ paddingLeft: '8px' }} />
                                </Row>
                              </TableCell>
                            </>}
                        </>
                      ))}
                    </CustomTableRow>
                  ))}
                </TableBody>
                {data.content && data.content.length == 0 &&
                  <>
                    <TableNoData isNotFound={true} />
                  </>}
              </Table>
            </>}
        </div>
        <Divider />
        <Box sx={{ padding: '0.75rem', display: 'flex', alignItems: 'center', columnGap: '0.5rem' }}>
          <Pagination
            style={{ marginLeft: 'auto' }}
            size={'medium'}
            count={getMaxPage(data?.total, data?.page_size)}
            page={page}
            variant='outlined' shape='rounded'
            color='primary'
            onChange={(_, num) => {
              onChangePage({
                ...searchObj,
                page: num
              })
            }} />
        </Box>
      </TableContainer >
    </>

  );
}