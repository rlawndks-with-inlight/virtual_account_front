
import { Avatar, Button, Card, CardHeader, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, Stack, Tab, Tabs, TextField, TextareaAutosize, Typography } from "@mui/material";
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
import { apiManager } from "src/utils/api-manager";
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
const ProductCategoryEdit = () => {
  const { setModal } = useModal()
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(defaultManagerObj.brands)

  useEffect(() => {
    settingPage();
  }, [])
  const settingPage = async () => {
    if (router.query?.edit_category == 'edit') {
      let data = await apiManager('product-categories', 'get', {
        id: router.query.id
      })
      console.log(data)
      setItem(data);
    }
    setLoading(false);
  }
  const onSave = async () => {
    let result = undefined
    console.log(item)
    if (item?.id) {//수정
      result = await apiManager('product-categories', 'update', item);
    } else {//추가
      result = await apiManager('product-categories', 'create', item);
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      router.push(`/manager/product/category`);
    }

  }
  return (
    <>
      {!loading &&
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Stack spacing={3}>
                  <Stack spacing={1}>
                    <CardHeader title={`카테고리 이미지 설정`} sx={{ padding: '0' }} />
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      카테고리 이미지
                    </Typography>
                    <Upload file={item.category_file || item.category_img} onDrop={(acceptedFiles) => {
                      const newFile = acceptedFiles[0];
                      if (newFile) {
                        setItem(
                          {
                            ...item,
                            ['category_file']: Object.assign(newFile, {
                              preview: URL.createObjectURL(newFile),
                            })
                          }
                        );
                      }
                    }} onDelete={() => {
                      setItem(
                        {
                          ...item,
                          ['category_img']: '',
                          ['category_file']: undefined,
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
                  <TextField
                    label='카테고리명'
                    value={item.name}
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['name']: e.target.value
                        }
                      )
                    }} />
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
ProductCategoryEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ProductCategoryEdit
