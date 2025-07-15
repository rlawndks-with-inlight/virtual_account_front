
import { Avatar, Button, Card, CardHeader, FormControl, FormControlLabel, Grid, IconButton, InputLabel, MenuItem, Select, Stack, Switch, Tab, Tabs, TextField, TextareaAutosize, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import { base64toFile, getAllIdsWithParents, onlyNumberText } from "src/utils/function";
import styled from "styled-components";
import { defaultManagerObj, react_quill_data } from "src/data/manager-data";
import { axiosIns } from "src/utils/axios";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import axios from "axios";
import { useAuthContext } from "src/auth/useAuthContext";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager } from "src/utils/api-manager";
import { apiCorpList, bankCodeList, operatorLevelList, withdrawFeeTypeList, withdrawTypeList } from "src/utils/format";
import _ from "lodash";
import { Icon } from "@iconify/react";
import navConfig from "src/layouts/manager/nav/config-navigation";
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})


const KakaoWrappers = styled.div`
width:100%;
background:#b3c9db;
min-height:400px;
display:flex;
padding-bottom: 1rem;
`
const BubbleTail = styled.div`

`
const OgWrappers = styled.div`
border-radius:16px;
background:#fff;
margin-top:0.5rem;
width:400px;

`
const OgImg = styled.div`
width:400px;
height:200px;
border-top-right-radius:16px;
border-top-left-radius:16px;
`
const OgDescription = styled.div`
display:flex;
flex-direction:column;
padding:0.5rem;
`
const BrandEdit = () => {
  const { setModal } = useModal()
  const { themeMode, themeDnsData } = useSettingsContext();
  const { user } = useAuthContext();
  const navList = navConfig(true);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [item, setItem] = useState(defaultManagerObj.brands)
  const tab_list = [
    {
      value: 0,
      label: '기본정보'
    },
    {
      value: 1,
      label: '카카오톡 설정'
    },
    /*
    {
      value: 2,
      label: '회사정보'
    }, 
    */
    ...(router.query?.edit_category == 'add' ? [{
      value: 3,
      label: '사용할 본사 계정'
    }] : []),
    ...(user?.level >= 50 ? [{
      value: 4,
      label: '영업점 단계설정'
    },] : []),
    ...(user?.level >= 50 ? [{
      value: 5,
      label: '데모설정'
    },] : []),
    ...(user?.level >= 50 ? [{
      value: 6,
      label: '수수료설정'
    },] : []),
    ...(user?.level >= 50 ? [{
      value: 7,
      label: 'api url 설정'
    },] : []),
    ...(user?.level >= 50 ? [{
      value: 8,
      label: '형식설정'
    },] : []),
    ...(user?.level >= 50 ? [{
      value: 9,
      label: 'API 버전설정'
    },] : []),
    ...(user?.level >= 50 ? [{
      value: 10,
      label: '옵션설정'
    },] : []),
    ...(user?.level >= 50 ? [{
      value: 11,
      label: '탭노출설정'
    },] : []),
  ]

  useEffect(() => {
    settingPage();
  }, [])
  const settingPage = async () => {
    if (router.query?.edit_category != 'add') {
      let brand_data = await apiManager('brands', 'get', {
        id: router.query.id || themeDnsData?.id
      })
      setItem(brand_data);
    }
    setLoading(false);
  }
  const onSave = async () => {
    let result = undefined
    if (item?.id) {//수정
      result = await apiManager('brands', 'update', item);
      if (result) {
        toast.success("성공적으로 저장 되었습니다.");
        if (router.query?.id) {
          router.push(`/manager/brand/list`);
        } else {
          router.push(`/manager/brand`);
        }
      }
    } else {//추가
      if (
        !item?.user_name ||
        !item?.user_pw ||
        !item?.user_pw_check
      ) {
        toast.error("본사 계정정보를 입력해 주세요.");
        return;
      }
      if (item?.user_pw != item?.user_pw_check) {
        toast.error("본사 비밀번호가 일치하지 않습니다.");
        return;
      }
      result = await apiManager('brands', 'create', item);
      if (result) {
        toast.success("성공적으로 저장 되었습니다.");
        if (router.query?.id) {
          router.push(`/manager/brand/list`);
        } else {
          router.push(`/manager/brand`);
        }
      }
    }

  }

  return (
    <>
      {!loading &&
        <>
          <Row style={{ margin: '0 0 1rem 0', columnGap: '0.5rem', overflow: 'auto' }}>
            {tab_list.map((tab) => (
              <Button
                variant={tab.value == currentTab ? 'contained' : 'outlined'}
                onClick={() => {
                  setCurrentTab(tab.value)
                }}
              >{tab.label}</Button>
            ))}
          </Row>
          <Grid container spacing={3}>
            {currentTab == 0 &&
              <>
                {/* <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack spacing={1}>
                        <CardHeader title={`브랜드 이미지 설정`} sx={{ padding: '0' }} />
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          브랜드로고
                        </Typography>
                        <Upload file={item.logo_file || item.logo_img} onDrop={(acceptedFiles) => {
                          const newFile = acceptedFiles[0];
                          if (newFile) {
                            setItem(
                              {
                                ...item,
                                ['logo_file']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile),
                                })
                              }
                            );
                          }
                        }} onDelete={() => {
                          setItem(
                            {
                              ...item,
                              ['logo_img']: '',
                              ['logo_file']: undefined,
                            }
                          )
                        }}
                        />
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          브랜드 다크모드 로고
                        </Typography>
                        <Upload file={item.dark_logo_file || item.dark_logo_img} onDrop={(acceptedFiles) => {
                          const newFile = acceptedFiles[0];
                          if (newFile) {
                            setItem(
                              {
                                ...item,
                                ['dark_logo_file']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile),
                                })
                              }
                            );
                          }
                        }} onDelete={() => {
                          setItem(
                            {
                              ...item,
                              ['dark_logo_img']: '',
                              ['dark_logo_file']: undefined,
                            }
                          )
                        }}
                        />
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          브랜드 파비콘
                        </Typography>
                        <Upload file={item.favicon_file || item.favicon_img} onDrop={(acceptedFiles) => {
                          const newFile = acceptedFiles[0];
                          if (newFile) {
                            setItem(
                              {
                                ...item,
                                ['favicon_file']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile),
                                })
                              }
                            );
                          }
                        }} onDelete={() => {
                          setItem(
                            {
                              ...item,
                              ['favicon_img']: '',
                              ['favicon_file']: undefined,
                            }
                          )
                        }}
                        />
                      </Stack>
                    </Stack>
                  </Card>
                </Grid> */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <TextField
                        label='브랜드명'
                        value={item.name}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['name']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='도메인'
                        value={item.dns}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['dns']: e.target.value
                            }
                          )
                        }} />
                      {user?.level >= 50 &&
                        <>
                          <TextField
                            label='상위도메인'
                            value={item.parent_dns}
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['parent_dns']: e.target.value
                                }
                              )
                            }} />
                        </>}
                      <TextField
                        label='메인색상'
                        value={item.theme_css?.main_color}
                        type="color"
                        style={{
                          border: 'none'
                        }}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['theme_css']: {
                                ...item.theme_css,
                                main_color: e.target.value
                              }
                            }
                          )
                        }} />
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      {user?.level >= 50 &&
                        <>
                          <TextField
                            label='납부일'
                            value={item.pay_day}
                            style={{
                              border: 'none'
                            }}
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['pay_day']: e.target.value
                                }
                              )
                            }}
                            InputProps={{
                              endAdornment: (
                                <div>일</div>
                              )
                            }}
                          />
                          <TextField
                            label='납부금액'
                            value={item.pay_amount}
                            style={{
                              border: 'none'
                            }}
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['pay_amount']: e.target.value
                                }
                              )
                            }}
                            InputProps={{
                              endAdornment: (
                                <div>원</div>
                              )
                            }}
                          />
                        </>}
                      {router.query?.edit_category == 'edit' &&
                        <>
                          <TextField
                            label='API KEY'
                            value={item.api_key}
                            disabled={true}
                          />
                        </>}
                      {item?.withdraw_type == 0 &&
                        <>
                          <TextField
                            label='guid'
                            value={item.guid}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['guid']: e.target.value
                                }
                              )
                            }} />
                        </>}
                      {item?.setting_obj?.is_use_withdraw == 1 &&
                        <>
                          <TextField
                            label='출금불가시작시간'
                            type="time"
                            value={item.setting_obj?.not_withdraw_s_time}
                            placeholder=""
                            onChange={e => {
                              setItem({
                                ...item,
                                ['setting_obj']: {
                                  ...item.setting_obj,
                                  [`not_withdraw_s_time`]: e.target.value
                                }
                              })
                            }}
                          />
                          <TextField
                            label='출금불가종료시간'
                            type="time"
                            value={item.setting_obj?.not_withdraw_e_time}
                            placeholder=""
                            onChange={e => {
                              setItem({
                                ...item,
                                ['setting_obj']: {
                                  ...item.setting_obj,
                                  [`not_withdraw_e_time`]: e.target.value
                                }
                              })
                            }}
                          />
                        </>}
                      {user?.level >= 45 &&
                        <>
                          <TextField
                            label='출금홀딩금액'
                            value={item.hold_amount}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['hold_amount']: onlyNumberText(e.target.value)
                                }
                              )
                            }}
                          />
                        </>}
                      {user?.level >= 45 &&
                        <>
                          <TextField
                            label='일 최대 출금금액'
                            value={item.withdraw_max_price}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['withdraw_max_price']: onlyNumberText(e.target.value)
                                }
                              )
                            }}
                          />
                        </>}
                      {user?.level >= 45 &&
                        <>
                          <TextField
                            label='월 최대 출금금액'
                            value={item.month_withdraw_max_price}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['month_withdraw_max_price']: onlyNumberText(e.target.value)
                                }
                              )
                            }}
                          />
                        </>}
                      {user?.level >= 45 &&
                        <>
                          <TextField
                            label='무조건 보류 출금금액'
                            value={item.must_hold_withdraw_amount}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['must_hold_withdraw_amount']: onlyNumberText(e.target.value)
                                }
                              )
                            }}
                          />
                        </>}
                      {item?.withdraw_type == 0 && item?.deposit_type == 'virtual_account' &&
                        <>
                          <Stack>
                            <FormControlLabel control={<Switch checked={item.setting_obj.is_virtual_acct_inspect == 1} />} label={`가상계좌 점검여부`}
                              onChange={(e) => {
                                setItem({
                                  ...item,
                                  ['setting_obj']: {
                                    ...item.setting_obj,
                                    [`is_virtual_acct_inspect`]: e.target.checked ? 1 : 0
                                  },
                                })
                              }}
                            />
                          </Stack>
                        </>}
                      {item?.withdraw_type == 0 && item?.deposit_type == 'gift_card' &&
                        <>
                          <Stack>
                            <FormControlLabel control={<Switch checked={item.setting_obj.is_gift_card_inspect == 1} />} label={`상품권 점검여부`}
                              onChange={(e) => {
                                setItem({
                                  ...item,
                                  ['setting_obj']: {
                                    ...item.setting_obj,
                                    [`is_gift_card_inspect`]: e.target.checked ? 1 : 0
                                  },
                                })
                              }}
                            />
                          </Stack>
                        </>}
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          비고
                        </Typography>
                        <ReactQuill
                          className="max-height-editor"
                          theme={'snow'}
                          id={'content'}
                          placeholder={''}
                          value={item.note}
                          modules={react_quill_data.modules}
                          formats={react_quill_data.formats}
                          onChange={async (e) => {
                            let note = e;
                            if (e.includes('<img src="') && e.includes('base64,')) {
                              let base64_list = e.split('<img src="');
                              for (var i = 0; i < base64_list.length; i++) {
                                if (base64_list[i].includes('base64,')) {
                                  let img_src = base64_list[i];
                                  img_src = await img_src.split(`"></p>`);
                                  let base64 = img_src[0];
                                  img_src = await base64toFile(img_src[0], 'note.png');
                                  const response = await apiManager('upload/single', 'create', {
                                    post_file: img_src,
                                  })
                                  note = await note.replace(base64, response?.url)
                                }
                              }
                            }
                            setItem({
                              ...item,
                              ['note']: note
                            });
                          }} />
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 1 &&
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack spacing={1}>
                        <CardHeader title={`카카오 미리보기 설정`} sx={{ padding: '0' }} />
                      </Stack>
                      <TextField
                        fullWidth
                        label="미리보기 디스트립션"
                        multiline
                        rows={4}
                        value={item.og_description}
                        onChange={(e) => {
                          setItem({
                            ...item,
                            ['og_description']: e.target.value
                          })
                        }}
                      />
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          미리보기 이미지
                        </Typography>
                        <Upload file={item.og_file || item.og_img} onDrop={(acceptedFiles) => {
                          const newFile = acceptedFiles[0];
                          if (newFile) {
                            setItem(
                              {
                                ...item,
                                ['og_file']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile),
                                })
                              }
                            );
                          }
                        }} onDelete={() => {
                          setItem(
                            {
                              ...item,
                              ['og_img']: '',
                              ['og_file']: undefined
                            }
                          )
                        }}
                        />
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack spacing={1}>
                        <CardHeader title={`카카오톡 링크 전송 시 예시`} sx={{ padding: '0' }} />
                        <KakaoWrappers>
                          <Avatar style={{ margin: '0.5rem' }} />
                          <Row style={{ flexDirection: 'column', marginTop: '0.5rem' }}>
                            <div>사용자</div>
                            <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '16px', color: 'blue', textDecoration: 'underline', width: 'auto', maxWidth: '300px' }}>
                              {'https://' + item?.dns}
                            </div>
                            <OgWrappers>
                              {(item?.og_img || item?.og_file) ?
                                <>
                                  <OgImg style={{
                                    backgroundImage: `url(${item?.og_file ? URL.createObjectURL(item?.og_file) : item?.og_img})`,
                                    backgroundSize: 'cover',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center'
                                  }} />
                                </>
                                :
                                <>
                                </>}
                              <OgDescription>
                                <div>{item?.name ? item?.name : '미리보기가 없습니다.'}</div>
                                <div style={{ fontSize: themeObj.font_size.size8, color: themeObj.grey[700], wordBreak: 'break-all' }}>{item?.og_description ? item?.og_description : '여기를 눌러 링크를 확인하세요.'}</div>
                                <div style={{ fontSize: themeObj.font_size.size9, color: themeObj.grey[500], marginTop: '0.5rem' }}>{window.location.origin}</div>
                              </OgDescription>
                            </OgWrappers>
                          </Row>
                        </KakaoWrappers>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 2 &&
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <TextField
                        label='회사명'
                        value={item.company_name}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['company_name']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='사업자등록번호'
                        value={item.business_num}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['business_num']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='주민등록번호'
                        value={item.resident_num}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['resident_num']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='대표자명'
                        value={item.ceo_name}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['ceo_name']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='개인정보 책임자명'
                        value={item.pvcy_rep_name}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['pvcy_rep_name']: e.target.value
                            }
                          )
                        }} />
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <TextField
                        label='주소'
                        value={item.addr}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['addr']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='휴대폰번호'
                        value={item.phone_num}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['phone_num']: onlyNumberText(e.target.value)
                            }
                          )
                        }} />
                      <TextField
                        label='팩스번호'
                        value={item.fax_num}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['fax_num']: e.target.value
                            }
                          )
                        }} />
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 3 &&
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <TextField
                        label='본사아이디'
                        value={item?.user_name}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['user_name']: e.target.value
                            }
                          )
                        }} />
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <TextField
                        label='본사 비밀번호'
                        value={item?.user_pw}
                        type='password'
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['user_pw']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='본사 비밀번호 확인'
                        value={item?.user_pw_check}
                        type='password'
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['user_pw_check']: e.target.value
                            }
                          )
                        }} />
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 4 &&
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      {operatorLevelList.map((itm, idx) => {
                        return <TextField
                          label='영업자등급6'
                          value={item?.level_obj[`sales${5 - idx}_name`]}
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['level_obj']: {
                                  ...item.level_obj,
                                  [`sales${5 - idx}_name`]: e.target.value
                                }
                              }
                            )
                          }} />
                      })}
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      {operatorLevelList.map((itm, idx) => {
                        return <Stack>
                          <FormControlLabel control={<Switch checked={item.level_obj[`is_use_sales${5 - idx}`] == 1} />} label={`${item.level_obj[`sales${5 - idx}_name`]} 사용여부`}
                            onChange={(e) => {
                              setItem({
                                ...item,
                                ['level_obj']: {
                                  ...item.level_obj,
                                  [`is_use_sales${5 - idx}`]: e.target.checked ? 1 : 0
                                }
                              })
                            }}
                          />
                        </Stack>
                      })}
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 5 &&
              <>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.setting_obj.is_use_deposit == 1} />} label={`입금 사용여부`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item.setting_obj,
                                [`is_use_deposit`]: e.target.checked ? 1 : 0
                              },
                            })
                          }}
                        />
                      </Stack>
                      <FormControl>
                        <InputLabel>상위사 선택</InputLabel>
                        <Select
                          label='상위사 선택'
                          value={item.deposit_corp_type}
                          onChange={e => {
                            let data = {
                              ...item,
                              ['deposit_corp_type']: e.target.value
                            };
                            if (e.target.value == 1) {
                              data['setting_obj'] = {
                                ...item.setting_obj,
                                [`api_virtual_account_version`]: 1,
                              }
                            } else if (e.target.value == 3) {
                              data['setting_obj'] = {
                                ...item.setting_obj,
                                [`api_virtual_account_version`]: 2,
                              }
                            } else if (e.target.value == 6) {
                              data['setting_obj'] = {
                                ...item.setting_obj,
                                [`api_virtual_account_version`]: 3,
                              }
                            } else if (e.target.value == 7) {
                              data['setting_obj'] = {
                                ...item.setting_obj,
                                [`api_virtual_account_version`]: 4,
                              }
                            } else if (e.target.value == 8) {
                              data['setting_obj'] = {
                                ...item.setting_obj,
                                [`api_virtual_account_version`]: 5,
                              }
                            } else {
                              data['setting_obj'] = {
                                ...item.setting_obj,
                                [`api_virtual_account_version`]: 0,
                              }
                            }
                            setItem(data)
                          }}
                        >
                          <MenuItem value={0}>선택안함</MenuItem>
                          {apiCorpList.map((itm, idx) => {
                            return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                          })}
                        </Select>
                      </FormControl>
                      {[1, 3].includes(item.deposit_corp_type) &&
                        <>
                          <TextField
                            label='GUID'
                            value={item.deposit_guid}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['deposit_guid']: e.target.value
                                }
                              )
                            }} />
                        </>}
                      {[1, 6, 7, 8].includes(item.deposit_corp_type) &&
                        <>
                          <TextField
                            label='API ID'
                            value={item.deposit_api_id}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['deposit_api_id']: e.target.value
                                }
                              )
                            }} />
                        </>}
                      {[1, 6, 7, 8].includes(item.deposit_corp_type) &&
                        <>
                          <TextField
                            label='API 서명키'
                            value={item.deposit_sign_key}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['deposit_sign_key']: e.target.value
                                }
                              )
                            }} />
                        </>}
                      {[1].includes(item.deposit_corp_type) &&
                        <>
                          <TextField
                            label='암호화키'
                            value={item.deposit_encr_key}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['deposit_encr_key']: e.target.value
                                }
                              )
                            }} />
                        </>}
                      {[1, 7].includes(item.deposit_corp_type) &&
                        <>
                          <TextField
                            label='IV'
                            value={item.deposit_iv}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['deposit_iv']: e.target.value
                                }
                              )
                            }} />
                        </>}
                      {[1, 2, 6, 8].includes(item.deposit_corp_type) &&
                        <>
                          <Stack spacing={1}>
                            <FormControl>
                              <InputLabel>입금가상계좌은행</InputLabel>
                              <Select
                                label='입금가상계좌은행'
                                value={item.deposit_virtual_bank_code}
                                onChange={e => {
                                  setItem({
                                    ...item,
                                    ['deposit_virtual_bank_code']: e.target.value
                                  })
                                }}
                              >
                                {bankCodeList().map((itm, idx) => {
                                  return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                                })}
                                <MenuItem value={'PINPLENET'}>핀플넷(상품권)</MenuItem>
                              </Select>
                            </FormControl>
                          </Stack>
                        </>}
                      <Stack spacing={1}>
                        <FormControl>
                          <InputLabel>입금타입</InputLabel>
                          <Select
                            label='입금타입'
                            value={item.deposit_type}
                            onChange={e => {
                              setItem({
                                ...item,
                                ['deposit_type']: e.target.value
                              })
                            }}
                          >
                            <MenuItem value={'virtual_account'}>가상계좌</MenuItem>
                            <MenuItem value={'gift_card'}>상품권</MenuItem>
                          </Select>
                        </FormControl>
                      </Stack>
                      <Stack spacing={1}>
                        <FormControl>
                          <InputLabel>입금처리타입</InputLabel>
                          <Select
                            label='입금타입'
                            value={item.deposit_process_type}
                            onChange={e => {
                              setItem({
                                ...item,
                                ['deposit_process_type']: e.target.value
                              })
                            }}
                          >
                            <MenuItem value={0}>일반</MenuItem>
                            <MenuItem value={1}>무기명</MenuItem>
                          </Select>
                        </FormControl>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.setting_obj.is_use_withdraw == 1} />} label={`출금 사용여부`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item.setting_obj,
                                [`is_use_withdraw`]: e.target.checked ? 1 : 0,
                              },
                            })
                          }}
                        />
                      </Stack>
                      <FormControl>
                        <InputLabel>상위사 선택</InputLabel>
                        <Select
                          label='상위사 선택'
                          value={item.withdraw_corp_type}
                          onChange={e => {
                            let data = {
                              ...item,
                              ['withdraw_corp_type']: e.target.value
                            };
                            console.log(e.target.value)
                            if (e.target.value == 1) {
                              data['setting_obj'] = {
                                ...item.setting_obj,
                                [`api_withdraw_version`]: 2,
                              }
                              data['withdraw_type'] = 0;
                            } else if (e.target.value == 2) {
                              data['setting_obj'] = {
                                ...item.setting_obj,
                                [`api_withdraw_version`]: 1,
                              }
                              data['withdraw_type'] = 1;
                            } else if (e.target.value == 5) {
                              data['setting_obj'] = {
                                ...item.setting_obj,
                                [`api_withdraw_version`]: 4,
                              }
                              data['withdraw_type'] = 1;
                            } else if (e.target.value == 6) {
                              data['setting_obj'] = {
                                ...item.setting_obj,
                                [`api_withdraw_version`]: 3,
                              }
                              data['withdraw_type'] = 1;
                            } else if (e.target.value == 7) {
                              data['setting_obj'] = {
                                ...item.setting_obj,
                                [`api_withdraw_version`]: 5,
                              }
                              data['withdraw_type'] = 0;
                            } else if (e.target.value == 8) {
                              data['setting_obj'] = {
                                ...item.setting_obj,
                                [`api_withdraw_version`]: 6,
                              }
                              data['withdraw_type'] = 1;
                            } else {
                              data['setting_obj'] = {
                                ...item.setting_obj,
                                [`api_withdraw_version`]: 0,
                              }
                            }
                            setItem(data)
                          }}
                        >
                          <MenuItem value={0}>선택안함</MenuItem>
                          {apiCorpList.map((itm, idx) => {
                            return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                          })}
                        </Select>
                      </FormControl>
                      {[1].includes(item.withdraw_corp_type) &&
                        <>
                          <TextField
                            label='GUID'
                            value={item.withdraw_guid}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['withdraw_guid']: e.target.value
                                }
                              )
                            }} />
                        </>}
                      {[5].includes(item.withdraw_corp_type) &&
                        <>
                          <TextField
                            label='가맹점ID'
                            value={item.withdraw_mid}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['withdraw_mid']: e.target.value
                                }
                              )
                            }} />
                        </>}
                      {[1, 5, 6, 7, 8].includes(item.withdraw_corp_type) &&
                        <>
                          <TextField
                            label='API ID'
                            value={item.withdraw_api_id}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['withdraw_api_id']: e.target.value
                                }
                              )
                            }} />
                        </>}
                      {[1, 2, 5, 6, 7, 8].includes(item.withdraw_corp_type) &&
                        <>
                          <TextField
                            label='API 서명키'
                            value={item.withdraw_sign_key}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['withdraw_sign_key']: e.target.value
                                }
                              )
                            }} />
                        </>}
                      {[1].includes(item.withdraw_corp_type) &&
                        <>
                          <TextField
                            label='암호화키'
                            value={item.withdraw_encr_key}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['withdraw_encr_key']: e.target.value
                                }
                              )
                            }} />
                        </>}
                      {[1, 7].includes(item.withdraw_corp_type) &&
                        <>
                          <TextField
                            label='IV'
                            value={item.withdraw_iv}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['withdraw_iv']: e.target.value
                                }
                              )
                            }} />
                        </>}

                      {[2,].includes(item.withdraw_corp_type) &&
                        <>
                          <TextField
                            label='취급기관코드'
                            value={item.withdraw_trt_inst_code}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['withdraw_trt_inst_code']: e.target.value
                                }
                              )
                            }} />
                        </>}
                      {[1, 2, 5, 6, 8].includes(item.withdraw_corp_type) &&
                        <>
                          <Stack spacing={1}>
                            <FormControl>
                              <InputLabel>출금가상계좌은행</InputLabel>
                              <Select
                                label='출금가상계좌은행'
                                value={item.withdraw_virtual_bank_code}
                                onChange={e => {
                                  setItem({
                                    ...item,
                                    ['withdraw_virtual_bank_code']: e.target.value
                                  })
                                }}
                              >
                                {bankCodeList('withdraw').map((itm, idx) => {
                                  return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                                })}
                                <MenuItem value={'PINPLENET'}>핀플넷(상품권)</MenuItem>
                              </Select>
                            </FormControl>
                          </Stack>
                        </>}
                      {[2, 5,].includes(item.withdraw_corp_type) &&
                        <>
                          <TextField
                            label='출금가상계좌번호'
                            value={item.withdraw_virtual_acct_num}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['withdraw_virtual_acct_num']: onlyNumberText(e.target.value)
                                }
                              )
                            }} />
                        </>}
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.setting_obj.is_use_auth == 1} />} label={`인증 사용여부`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item.setting_obj,
                                [`is_use_auth`]: e.target.checked ? 1 : 0
                              },
                            })
                          }}
                        />
                      </Stack>
                      <FormControl>
                        <InputLabel>상위사 선택</InputLabel>
                        <Select
                          label='상위사 선택'
                          value={item.auth_corp_type}
                          onChange={e => {
                            let data = {
                              ...item,
                              ['auth_corp_type']: e.target.value
                            };
                            if (e.target.value == 5) {
                              data['setting_obj'] = {
                                ...item.setting_obj,
                                [`api_auth_version`]: 1,
                              }
                            }
                            setItem(data)
                          }}
                        >
                          <MenuItem value={0}>선택안함</MenuItem>
                          {apiCorpList.map((itm, idx) => {
                            return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                          })}
                        </Select>
                      </FormControl>
                      <TextField
                        label='상점아이디'
                        value={item.auth_mcht_id}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['auth_mcht_id']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='API ID'
                        value={item.auth_api_id}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['auth_api_id']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='IV'
                        value={item.auth_iv}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['auth_iv']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='인증당 발생하는 비용'
                        value={item.auth_fee}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['auth_fee']: onlyNumberText(e.target.value)
                            }
                          )
                        }}
                        InputProps={{
                          endAdornment: (
                            <div>원</div>
                          )
                        }}
                      />
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 6 &&
              <>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.is_use_fee_operator == 1} />} label={`입금시 영업자 요율 사용여부`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['is_use_fee_operator']: e.target.checked ? 1 : 0,
                            })
                          }}
                        />
                      </Stack>
                      {user?.level >= 50 &&
                        <>
                          <TextField
                            label='본사 입금요율'
                            value={item.head_office_fee}
                            placeholder=""
                            type="number"
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['head_office_fee']: e.target.value
                                }
                              )
                            }}
                            InputProps={{
                              endAdornment: (
                                <div>%</div>
                              )
                            }}
                          />
                        </>}
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.is_use_deposit_operator == 1} />} label={`입금시 영업자 입금 수수료 사용여부`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['is_use_deposit_operator']: e.target.checked ? 1 : 0,
                            })
                          }}
                        />
                      </Stack>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.setting_obj?.is_settle_user_deposit_operator == 1} />} label={`정산금 지급시 입금시 영업자 입금 수수료 사용여부`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item.setting_obj,
                                [`is_settle_user_deposit_operator`]: e.target.checked ? 1 : 0
                              },
                            })
                          }}
                        />
                      </Stack>
                      <TextField
                        label='입금수수료 기본값'
                        value={item.default_deposit_fee}
                        placeholder=""
                        type="number"
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['default_deposit_fee']: e.target.value
                            }
                          )
                        }}
                        InputProps={{
                          endAdornment: (
                            <div>원</div>
                          )
                        }}
                      />
                      {user?.level >= 50 &&
                        <>
                          <TextField
                            label='본사 입금수수료'
                            value={item.deposit_head_office_fee}
                            placeholder=""
                            type="number"
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['deposit_head_office_fee']: e.target.value
                                }
                              )
                            }}
                            InputProps={{
                              endAdornment: (
                                <div>원</div>
                              )
                            }}
                          />
                        </>}
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.is_use_withdraw_operator == 1} />} label={`출금시 영업자 수수료 사용여부`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['is_use_withdraw_operator']: e.target.checked ? 1 : 0,
                            })
                          }}
                        />
                      </Stack>
                      <TextField
                        label='출금수수료 기본값'
                        value={item.default_withdraw_fee}
                        placeholder=""
                        type="number"
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['default_withdraw_fee']: e.target.value
                            }
                          )
                        }}
                        InputProps={{
                          endAdornment: (
                            <div>원</div>
                          )
                        }}
                      />
                      <TextField
                        label='최대출금금액'
                        value={item.default_withdraw_max_price}
                        type="number"
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['default_withdraw_max_price']: e.target.value
                            }
                          )
                        }}
                        InputProps={{
                          endAdornment: (
                            <div>원</div>
                          )
                        }}
                      />
                      <FormControlLabel control={<Switch checked={item.setting_obj.is_use_daily_withdraw == 1} />} label={`일일 출금금액 설정`}
                        onChange={(e) => {
                          setItem({
                            ...item,
                            ['setting_obj']: {
                              ...item.setting_obj,
                              [`is_use_daily_withdraw`]: e.target.checked ? 1 : 0
                            },
                          })
                        }}
                      />
                      {user?.level >= 50 &&
                        <>
                          <TextField
                            label='본사 출금수수료'
                            value={item.withdraw_head_office_fee}
                            placeholder=""
                            type="number"
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['withdraw_head_office_fee']: e.target.value
                                }
                              )
                            }}
                            InputProps={{
                              endAdornment: (
                                <div>원</div>
                              )
                            }}
                          />
                        </>}
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 7 &&
              <>
                <Grid item xs={12} md={12}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <TextField
                        label='API URL'
                        value={item.api_url}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['api_url']: e.target.value
                            }
                          )
                        }}
                      />
                      <TextField
                        label='입금 노티 주소'
                        value={item.deposit_noti_url}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['deposit_noti_url']: e.target.value
                            }
                          )
                        }}
                      />
                      <TextField
                        label='출금 노티 주소'
                        value={item.withdraw_noti_url}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['withdraw_noti_url']: e.target.value
                            }
                          )
                        }}
                      />
                      <TextField
                        label='출금실패 노티 주소'
                        value={item.withdraw_fail_noti_url}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['withdraw_fail_noti_url']: e.target.value
                            }
                          )
                        }}
                      />
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 8 &&
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <FormControl>
                        <InputLabel>출금형식 선택</InputLabel>
                        <Select
                          label='출금형식 선택'
                          value={item.withdraw_type}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['withdraw_type']: e.target.value
                            })
                          }}
                        >
                          {withdrawTypeList.map((itm) => {
                            return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                          })}
                        </Select>
                      </FormControl>
                      <FormControl>
                        <InputLabel>출금수수료형식 선택</InputLabel>
                        <Select
                          label='출금수수료형식 선택'
                          value={item.withdraw_fee_type}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['withdraw_fee_type']: e.target.value
                            })
                          }}
                        >
                          {withdrawFeeTypeList.map((itm) => {
                            return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                          })}
                        </Select>
                      </FormControl>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 9 &&
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <FormControl>
                        <InputLabel>가상계좌버전</InputLabel>
                        <Select
                          label='가상계좌버전'
                          value={item.setting_obj?.api_virtual_account_version}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item.setting_obj,
                                [`api_virtual_account_version`]: e.target.value
                              }
                            })
                          }}
                        >
                          <MenuItem value={0}>{'선택안함'}</MenuItem>
                          <MenuItem value={1}>{'v1'}</MenuItem>
                          <MenuItem value={2}>{'v2'}</MenuItem>
                          <MenuItem value={3}>{'v3'}</MenuItem>
                          <MenuItem value={4}>{'v4'}</MenuItem>
                          <MenuItem value={5}>{'v5'}</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <InputLabel>출금버전</InputLabel>
                        <Select
                          label='출금버전'
                          value={item.setting_obj?.api_withdraw_version}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item.setting_obj,
                                [`api_withdraw_version`]: e.target.value
                              }
                            })
                          }}
                        >
                          <MenuItem value={0}>{'선택안함'}</MenuItem>
                          <MenuItem value={1}>{'v1'}</MenuItem>
                          <MenuItem value={2}>{'v2'}</MenuItem>
                          <MenuItem value={3}>{'v3'}</MenuItem>
                          <MenuItem value={4}>{'v4'}</MenuItem>
                          <MenuItem value={5}>{'v5'}</MenuItem>
                          <MenuItem value={6}>{'v6'}</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <InputLabel>입금버전</InputLabel>
                        <Select
                          label='입금버전'
                          value={item.setting_obj?.api_deposit_version}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item.setting_obj,
                                [`api_deposit_version`]: e.target.value
                              }
                            })
                          }}
                        >
                          <MenuItem value={0}>{'선택안함'}</MenuItem>
                          <MenuItem value={1}>{'v1'}</MenuItem>
                          <MenuItem value={2}>{'v2'}</MenuItem>
                          <MenuItem value={3}>{'v3'}</MenuItem>
                          <MenuItem value={4}>{'v4'}</MenuItem>
                          <MenuItem value={5}>{'v5'}</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <InputLabel>인증버전</InputLabel>
                        <Select
                          label='인증버전'
                          value={item.setting_obj?.api_auth_version}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item.setting_obj,
                                [`api_auth_version`]: e.target.value
                              }
                            })
                          }}
                        >
                          <MenuItem value={0}>{'선택안함'}</MenuItem>
                          <MenuItem value={1}>{'v1'}</MenuItem>
                          <MenuItem value={2}>{'v2'}</MenuItem>
                          <MenuItem value={3}>{'v3'}</MenuItem>
                          <MenuItem value={4}>{'v4'}</MenuItem>
                          <MenuItem value={5}>{'v5'}</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 10 &&
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.is_use_telegram_bot == 1} />} label={`텔레봇사용여부`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['is_use_telegram_bot']: e.target.checked ? 1 : 0,
                            })
                          }}
                        />
                      </Stack>
                      <TextField
                        label='TELEGRAM BOT TOKEN'
                        value={item.telegram_bot_token}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['telegram_bot_token']: e.target.value
                            }
                          )
                        }}
                      />
                      <TextField
                        label='텔레그램봇아이디'
                        value={item.telegram_bot_id}
                        placeholder=""
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['telegram_bot_id']: e.target.value
                            }
                          )
                        }}
                      />
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.is_use_otp == 1} />} label={`OTP 사용여부`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['is_use_otp']: e.target.checked ? 1 : 0,
                            })
                          }}
                        />
                      </Stack>
                      <TextField
                        label='OTP 키'
                        value={item.otp_token}
                        placeholder=""
                        disabled={true}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['otp_token']: e.target.value
                            }
                          )
                        }}
                        InputProps={{
                          endAdornment: <IconButton onClick={async () => {
                            let result = await apiManager(`brands/otp`, 'create');
                            setItem({
                              ...item,
                              ['otp_token']: result?.base32,
                            })
                          }}>
                            <Icon icon='gg:redo' />
                          </IconButton>
                        }}
                      />
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.is_use_sign_key == 1} />} label={`sign key 사용여부`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['is_use_sign_key']: e.target.checked ? 1 : 0,
                            })
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.is_use_corp_account == 1} />} label={`법인통장사용여부`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['is_use_corp_account']: e.target.checked ? 1 : 0,
                            })
                          }}
                        />
                      </Stack>
                      {item.is_use_corp_account == 1 &&
                        <>
                          <FormControl>
                            <InputLabel>상위사 선택</InputLabel>
                            <Select
                              label='상위사 선택'
                              value={item.corp_account_corp_type}
                              onChange={e => {
                                let data = {
                                  ...item,
                                  ['corp_account_corp_type']: e.target.value
                                };
                                if (e.target.value == 1) {
                                  data['setting_obj'] = {
                                    ...item.setting_obj,
                                    [`api_deposit_version`]: 1,
                                  }
                                } else {
                                  data['setting_obj'] = {
                                    ...item.setting_obj,
                                    [`api_deposit_version`]: 0,
                                  }
                                }
                                setItem(data);
                              }}
                            >
                              <MenuItem value={0}>선택안함</MenuItem>
                              {apiCorpList.map((itm, idx) => {
                                return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                              })}
                            </Select>
                          </FormControl>
                        </>}

                      <Stack>
                        <FormControlLabel control={<Switch checked={item.is_can_add_deposit == 1} />} label={`입금추가여부`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['is_can_add_deposit']: e.target.checked ? 1 : 0,
                            })
                          }}
                        />
                      </Stack>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.setting_obj?.is_reload_when_deposit == 1} />} label={`입금들어올시 결제내역페이지 새로고침`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              setting_obj: {
                                ...item.setting_obj,
                                ['is_reload_when_deposit']: e.target.checked ? 1 : 0,
                              }
                            })
                          }}
                        />
                      </Stack>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.is_use_asapmall_noti == 1} />} label={`asapmall 노티사용여부`}
                          onChange={(e) => {
                            let obj = {
                              ...item,
                              ['is_use_asapmall_noti']: e.target.checked ? 1 : 0,
                            }
                            if (!e.target.checked) {
                              obj['asapmall_dns'] = '';
                            }
                            setItem(obj)
                          }}
                        />
                      </Stack>
                      {item?.is_use_asapmall_noti == 1 &&
                        <>
                          <TextField
                            label='asapmall 도메인'
                            value={item.asapmall_dns}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['asapmall_dns']: e.target.value
                                }
                              )
                            }}
                          />
                          <TextField
                            label='asapmall back 도메인'
                            value={item.asapmall_back_dns}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['asapmall_back_dns']: e.target.value
                                }
                              )
                            }}
                          />
                        </>}
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.setting_obj?.is_use_bulk_upload == 1} />} label={`대량등록 사용여부`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              setting_obj: {
                                ...item.setting_obj,
                                ['is_use_bulk_upload']: e.target.checked ? 1 : 0,
                              }
                            })
                          }}
                        />
                      </Stack>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.setting_obj?.is_use_virtual_user_name == 1} />} label={`가상계좌 발급시 아이디 입력여부`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              setting_obj: {
                                ...item.setting_obj,
                                ['is_use_virtual_user_name']: e.target.checked ? 1 : 0,
                              }
                            })
                          }}
                        />
                      </Stack>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.setting_obj?.is_use_withdraw_success_button == 1} />} label={`출금관리에서 성공버튼 사용여부`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              setting_obj: {
                                ...item.setting_obj,
                                ['is_use_withdraw_success_button']: e.target.checked ? 1 : 0,
                              }
                            })
                          }}
                        />
                      </Stack>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.setting_obj?.is_auto_parent_brand_settle == 1} />} label={`상위 전산 있을시 자동 모계좌 차감여부`}
                          onChange={(e) => {
                            setItem({
                              ...item,
                              setting_obj: {
                                ...item.setting_obj,
                                ['is_auto_parent_brand_settle']: e.target.checked ? 1 : 0,
                              }
                            })
                          }}
                        />
                      </Stack>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.is_use_destruct_auto_virtual_acct == 1} />} label={`가상계좌 자동파기 사용여부`}
                          onChange={(e) => {
                            let obj = {
                              ...item,
                              ['is_use_destruct_auto_virtual_acct']: e.target.checked ? 1 : 0,
                            }
                            if (!e.target.checked) {
                              obj['destruct_auto_virtual_acct_minute'] = 0;
                            }
                            setItem(obj)
                          }}
                        />
                      </Stack>
                      {item?.is_use_destruct_auto_virtual_acct == 1 &&
                        <>
                          <TextField
                            label='자동파기 시간'
                            value={item.destruct_auto_virtual_acct_minute}
                            placeholder=""
                            onChange={(e) => {
                              setItem(
                                {
                                  ...item,
                                  ['destruct_auto_virtual_acct_minute']: onlyNumberText(e.target.value)
                                }
                              )
                            }}
                            InputProps={{
                              endAdornment: <div>분</div>
                            }}
                          />
                        </>}
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 11 &&
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      {navList && navList.map((tab) => (
                        <>
                          {tab.id != 'brand' &&
                            <>
                              <Stack>
                                <FormControlLabel control={<Switch checked={item.setting_obj[`is_not_show_tab_${tab.id}`] != 1} />} label={tab.items[0]?.title}
                                  onChange={(e) => {
                                    setItem({
                                      ...item,
                                      ['setting_obj']: {
                                        ...item.setting_obj,
                                        [`is_not_show_tab_${tab.id}`]: e.target.checked ? 0 : 1
                                      },
                                    })
                                  }}
                                />
                              </Stack>
                            </>}
                        </>
                      ))}
                    </Stack>
                  </Card>
                </Grid>
              </>}
            <Grid item xs={12} md={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={1} style={{ display: 'flex' }}>
                  <Button variant="contained" style={{
                    height: '48px', width: '120px', marginLeft: 'auto'
                  }} onClick={() => {
                    setModal({
                      func: () => { onSave() },
                      icon: 'material-symbols:edit-outline',
                      title: '저장 하시겠습니까?'
                    })
                  }}>
                    저장
                  </Button>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </>}
    </>
  )
}
BrandEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default BrandEdit
