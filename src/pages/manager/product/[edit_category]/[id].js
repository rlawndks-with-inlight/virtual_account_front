
import { Avatar, Button, Card, CardHeader, FormControl, FormControlLabel, Grid, IconButton, InputAdornment, InputLabel, MenuItem, OutlinedInput, Select, Stack, Tab, Tabs, TextField, TextareaAutosize, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import { base64toFile, getAllIdsWithParents } from "src/utils/function";
import styled from "styled-components";
import { defaultManagerObj, react_quill_data } from "src/data/manager-data";
import { axiosIns } from "src/utils/axios";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import axios from "axios";
import { useAuthContext } from "src/auth/useAuthContext";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { apiManager, uploadMultipleFiles } from "src/utils/api-manager";
import { product_status_list } from "src/data/status-data";
import _ from "lodash";
import { Icon } from "@iconify/react";
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

const ProductEdit = () => {
  const { user } = useAuthContext();
  const { setModal } = useModal()
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(defaultManagerObj.products);
  const [categoryList, setCategoryList] = useState([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [budget, setBudget] = useState({
  })
  const tab_list = [
    {
      value: 0,
      label: '기본정보'
    },
    {
      value: 1,
      label: '상품기본특성설정'
    },
    {
      value: 2,
      label: '옵션설정'
    },
  ]
  useEffect(() => {
    settingPage();
  }, [])
  const isCanEditItem = () => {
    return user?.level >= 40;
  }
  const settingPage = async () => {
    let category_content = await apiManager('product-categories', 'list');
    if (!(category_content?.content.length > 0)) {
      toast.error('상품 카테고리를 우선 추가해주세요.');
      router.push('/manager/product/category');
    }
    setCategoryList(category_content?.content);

    if (router.query?.edit_category == 'edit') {
      let data = await apiManager('products', 'get', {
        id: router.query.id
      })
      setBudget(data?.budget)
      setItem(data);
    }
    setLoading(false);
  }
  const handleDropMultiFile = (acceptedFiles) => {
    let product_sub_imgs = [...item.product_sub_imgs];
    for (var i = 0; i < acceptedFiles.length; i++) {
      product_sub_imgs.push({
        product_sub_file: Object.assign(acceptedFiles[i], {
          preview: URL.createObjectURL(acceptedFiles[i])
        }),
      })
    }
    setItem({ ...item, ['product_sub_imgs']: product_sub_imgs })
  };

  const handleRemoveFile = (inputFile) => {
    let product_sub_imgs = [...item.product_sub_imgs];
    let find_index = _.findIndex(product_sub_imgs.map(img => { return img.product_sub_file }), {
      path: inputFile.path,
      preview: inputFile.preview
    });

    if (find_index < 0) {
      for (var i = 0; i < product_sub_imgs.length; i++) {
        if (product_sub_imgs[i]?.product_sub_img == inputFile) {
          find_index = i;
        }
      }
    }
    if (find_index >= 0) {
      if (product_sub_imgs[find_index]?.id) {
        product_sub_imgs[find_index].is_delete = 1;
      } else {
        product_sub_imgs.splice(find_index, 1);
      }
      setItem({ ...item, ['product_sub_imgs']: product_sub_imgs })
    }
  };

  const handleRemoveAllFiles = () => {
    let product_sub_imgs = [...item.product_sub_imgs];
    product_sub_imgs = [];
    setItem({ ...item, ['product_sub_imgs']: product_sub_imgs })
  };
  const onSave = async () => {
    let result = undefined;
    let product_sub_imgs = item.product_sub_imgs;
    let product_sub_imgs_result = [];
    let files = [];
    for (var i = 0; i < product_sub_imgs.length; i++) {
      if (product_sub_imgs[i]?.is_delete != 1) {
        if (product_sub_imgs[i]?.product_sub_file) {
          files.push(product_sub_imgs[i]?.product_sub_file)
        }
      }
    }
    let file_result = await uploadMultipleFiles(files);
    let file_result_idx = 0;
    for (var i = 0; i < product_sub_imgs.length; i++) {
      if (product_sub_imgs[i]?.is_delete != 1) {
        if (product_sub_imgs[i]?.product_sub_file) {
          product_sub_imgs_result.push({
            product_sub_img: file_result[file_result_idx].url,
          })
          file_result_idx++;
        } else {
          product_sub_imgs_result.push({
            product_sub_img: product_sub_imgs[i]?.product_sub_img,
          })
        }
      }
    }
    if (user?.level >= 40) {
      if (item?.id) {//수정
        result = await apiManager('products', 'update', { ...item, product_sub_imgs: product_sub_imgs_result });
      } else {//추가
        result = await apiManager('products', 'create', { ...item, product_sub_imgs: product_sub_imgs_result });
      }
    }
    if (Object.keys(budget ?? {}).length > 0) {
      if (budget?.budget_price < item.price) {
        return toast.error('판매가는 정책가보다 작을 수 없습니다.');
      }
      result = await apiManager('products/budget', 'create', { ...budget, product_id: item.id, user_id: user?.id });
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      router.push(`/manager/product`);
    }
  }
  return (
    <>
      {!loading &&
        <>
          <Row style={{ margin: '0 0 1rem 0', columnGap: '0.5rem' }}>
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
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          상품 이미지
                        </Typography>
                        <Upload
                          disabled={!isCanEditItem()}
                          file={item.product_file || item.product_img} onDrop={(acceptedFiles) => {
                            const newFile = acceptedFiles[0];
                            if (newFile) {
                              setItem(
                                {
                                  ...item,
                                  ['product_file']: Object.assign(newFile, {
                                    preview: URL.createObjectURL(newFile),
                                  })
                                }
                              );
                            }
                          }} onDelete={() => {
                            setItem(
                              {
                                ...item,
                                ['product_img']: '',
                                ['product_file']: undefined,
                              }
                            )
                          }}
                        />
                      </Stack>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          개별이미지등록 (여러장 업로드)
                        </Typography>
                        <Upload
                          multiple
                          thumbnail={true}
                          files={item.product_sub_imgs && item.product_sub_imgs.map(img => {
                            if (img.is_delete == 1) {
                              return undefined;
                            }
                            if (img.product_sub_img) {
                              return img.product_sub_img
                            } else {
                              return img.product_sub_file
                            }
                          }).filter(e => e)}
                          onDrop={(acceptedFiles) => {
                            handleDropMultiFile(acceptedFiles)
                          }}
                          onRemove={(inputFile) => {
                            handleRemoveFile(inputFile)
                          }}
                          onRemoveAll={() => {
                            handleRemoveAllFiles();
                          }}
                          fileExplain={{
                            width: ''//파일 사이즈 설명
                          }}
                          imageSize={{ //썸네일 사이즈
                            width: 200,
                            height: 200
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <FormControl>
                        <InputLabel>상품카테고리</InputLabel>
                        <Select
                          disabled={!isCanEditItem()}
                          label='쇼핑몰 데모넘버'
                          value={item?.category_id} onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                category_id: e.target.value
                              }
                            )
                          }}>
                          {categoryList.map((item, idx) => {
                            return <MenuItem value={item?.id}>{item?.name}</MenuItem>
                          })}
                        </Select>
                      </FormControl>
                      <TextField
                        label='상품명'
                        disabled={!isCanEditItem()}
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
                        label='상품서브명'
                        disabled={!isCanEditItem()}
                        value={item.sub_name}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['sub_name']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='정책가'
                        disabled={!isCanEditItem()}
                        value={item.price}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['price']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='판매가(책정가)'
                        value={budget?.budget_price ?? item.price}
                        onChange={(e) => {
                          setBudget(
                            {
                              ...budget,
                              ['budget_price']: e.target.value
                            }
                          )
                        }} />
                      <FormControl>
                        <InputLabel>상태</InputLabel>
                        <Select label='상태' value={item.status} onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['status']: e.target.value
                            }
                          )
                        }}>
                          {product_status_list.map((itm, idx) => {
                            return <MenuItem value={idx}>{itm.title}</MenuItem>
                          })}
                        </Select>
                      </FormControl>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          상품설명
                        </Typography>
                        <ReactQuill
                          readOnly={!isCanEditItem()}
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
                <Grid item xs={12} md={12}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack spacing={1} style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          상품특성
                        </Typography>
                        {item.characters.map((character, index) => (
                          <>
                            {character?.is_delete != 1 &&
                              <>
                                <Row style={{ columnGap: '0.5rem' }}>
                                  <TextField
                                    sx={{ flexGrow: 1 }}
                                    label='특성옵션명'
                                    placeholder="예시) 원산지"
                                    value={character.character_key}
                                    onChange={(e) => {
                                      let character_list = item?.characters;
                                      character_list[index].character_key = e.target.value;
                                      setItem(
                                        {
                                          ...item,
                                          ['characters']: character_list
                                        }
                                      )
                                    }} />
                                  <FormControl variant="outlined" sx={{ flexGrow: 1 }}>
                                    <InputLabel>특성값</InputLabel>
                                    <OutlinedInput
                                      label='특성값'
                                      placeholder="예시) 국내산"
                                      value={character.character_value}
                                      onChange={(e) => {
                                        let character_list = item?.characters;
                                        character_list[index].character_value = e.target.value;
                                        setItem(
                                          {
                                            ...item,
                                            ['characters']: character_list
                                          }
                                        )
                                      }} />
                                  </FormControl>
                                  <IconButton onClick={() => {
                                    let character_list = item?.characters;
                                    if (character_list[index]?.id) {
                                      character_list[index].is_delete = 1;
                                    } else {
                                      character_list.splice(idx, 1);
                                    }
                                    setItem(
                                      {
                                        ...item,
                                        ['characters']: character_list
                                      }
                                    )
                                  }}>
                                    <Icon icon='material-symbols:delete-outline' />
                                  </IconButton>
                                </Row>
                              </>}
                          </>
                        ))}
                        <Button variant="outlined" sx={{ height: '48px' }} onClick={() => {
                          let character_list = [...item.characters];
                          character_list.push({
                            character_key: '',
                            character_value: '',
                          })
                          setItem({
                            ...item,
                            ['characters']: character_list
                          })
                        }}>상품특성 추가</Button>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              </>}
            {currentTab == 2 &&
              <>
                <Grid item xs={12} md={12}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack spacing={1} style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          상품옵션
                        </Typography>
                        {item.groups.map((group, index) => (
                          <>
                            {group?.is_delete != 1 &&
                              <>
                                <Row style={{ columnGap: '0.5rem', width: '100%' }}>
                                  <FormControl variant="outlined" style={{ width: '100%' }}>
                                    <InputLabel>옵션그룹명</InputLabel>
                                    <OutlinedInput
                                      label='옵션그룹명'
                                      placeholder="예시) 색상"
                                      value={group.group_name}
                                      endAdornment={<>
                                        <Button style={{ width: '114px', height: '56px', transform: 'translateX(14px)' }}
                                          variant="contained"
                                          onClick={() => {
                                            let option_list = item?.groups;
                                            option_list[index].options.push({
                                              option_name: '',
                                              option_price: 0,
                                              option_description: '',
                                              option_file: undefined,
                                            })
                                            setItem(
                                              {
                                                ...item,
                                                ['groups']: option_list
                                              }
                                            )
                                          }}
                                        >옵션추가</Button>
                                      </>}
                                      onChange={(e) => {
                                        let option_list = item?.groups;
                                        option_list[index].group_name = e.target.value;
                                        setItem(
                                          {
                                            ...item,
                                            ['groups']: option_list
                                          }
                                        )
                                      }} />
                                  </FormControl>
                                  <IconButton onClick={() => {
                                    let option_list = item?.groups;
                                    if (option_list[index]?.id) {
                                      option_list[index].is_delete = 1;
                                    } else {
                                      option_list.splice(index, 1);
                                    }
                                    setItem(
                                      {
                                        ...item,
                                        ['groups']: option_list
                                      }
                                    )
                                  }}>
                                    <Icon icon='material-symbols:delete-outline' />
                                  </IconButton>
                                </Row>
                                {group?.options && group?.options.map((option, idx) => (
                                  <>
                                    {option?.is_delete != 1 &&
                                      <>
                                        <Row style={{ columnGap: '0.5rem' }}>
                                          <TextField
                                            sx={{ flexGrow: 1 }}
                                            label='옵션명'
                                            placeholder="예시) 블랙"
                                            value={option.option_name}
                                            onChange={(e) => {
                                              let option_list = item?.groups;
                                              option_list[index].options[idx].option_name = e.target.value;
                                              setItem(
                                                {
                                                  ...item,
                                                  ['groups']: option_list
                                                }
                                              )
                                            }} />
                                          <FormControl variant="outlined" sx={{ flexGrow: 1 }}>
                                            <InputLabel>변동가</InputLabel>
                                            <OutlinedInput
                                              label='변동가'
                                              type="number"
                                              value={option.option_price}
                                              endAdornment={<InputAdornment position="end">원</InputAdornment>}
                                              onChange={(e) => {
                                                let option_list = item?.groups;
                                                option_list[index].options[idx].option_price = e.target.value;
                                                setItem(
                                                  {
                                                    ...item,
                                                    ['groups']: option_list
                                                  }
                                                )
                                              }} />
                                          </FormControl>
                                          <IconButton onClick={() => {
                                            let option_list = item?.groups;
                                            console.log(option_list[index])
                                            if (option_list[index].options[idx]?.id) {
                                              option_list[index].options[idx].is_delete = 1;
                                            } else {
                                              option_list[index].options.splice(idx, 1);
                                            }
                                            setItem(
                                              {
                                                ...item,
                                                ['groups']: option_list
                                              }
                                            )
                                          }}>
                                            <Icon icon='material-symbols:delete-outline' />
                                          </IconButton>
                                        </Row>
                                      </>}
                                  </>
                                ))}
                              </>}

                          </>
                        ))}
                        <Button variant="outlined" sx={{ height: '48px' }} onClick={() => {
                          let option_list = [...item.groups];
                          option_list.push({
                            group_name: '',
                            group_description: '',
                            group_file: undefined,
                            options: []
                          })
                          setItem({
                            ...item,
                            ['groups']: option_list
                          })
                        }}>옵션그룹 추가</Button>
                      </Stack>
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
ProductEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ProductEdit
