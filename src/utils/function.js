import { deleteLocalStorage, getLocalStorage } from "./local-storage";
import { LOCALSTORAGE } from "src/data/data";
import { t } from "i18next";
import { toast } from "react-hot-toast";
import { deleteCookie, getCookie } from "./react-cookie";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import $ from 'jquery';

export const objToQuery = (obj_) => {
  let obj = { ...obj_ };
  let query = "";
  for (var i = 0; i < Object.keys(obj).length; i++) {
    if (i == 0) {
      query += '?';
    }
    query += `${Object.keys(obj)[i]}=${obj[Object.keys(obj)[i]]}&`;
  }

  return query;
}

export const makeMaxPage = (total, page_cut) => {
  if (total % page_cut == 0) {
    return total / page_cut;
  } else {
    return parseInt(total / page_cut) + 1;
  }
}

export const returnMoment = (num, date) => {//num 0: 오늘, num -1: 어제 , date->new Date() 인자로 받음
  try {
    var today = new Date();
    if (num) {
      let new_date = new Date(today.setDate(today.getDate() + num));
      today = new_date;
    }
    if (date) {
      today = date;
    }
    var year = today.getFullYear();
    var month = ('0' + (today.getMonth() + 1)).slice(-2);
    var day = ('0' + today.getDate()).slice(-2);
    var dateString = year + '-' + month + '-' + day;
    var hours = ('0' + today.getHours()).slice(-2);
    var minutes = ('0' + today.getMinutes()).slice(-2);
    var seconds = ('0' + today.getSeconds()).slice(-2);
    var timeString = hours + ':' + minutes + ':' + seconds;
    let moment = dateString + ' ' + timeString;
    return moment;
  } catch (err) {
    console.log(err);
    return false;
  }

}

export const commarNumber = (num) => {
  if (num > 0 && num < 0.000001) {
    return "0.00";
  }
  if (!num) {
    return 0;
  }
  if (num > 0 && num < 0.000001) {
    return "0.00";
  }
  if (!num && num != 0) {
    return undefined;
  }
  let str = "";
  if (typeof num == "string") {
    str = num;
  } else {
    str = num.toString();
  }

  let decimal = "";
  if (str.includes(".")) {
    decimal = "." + str.split(".")[1].substring(0, 2);
    str = str.split(".")[0];
  } else {
    decimal = "";
  }
  if (str?.length <= 3) {
    return str + decimal;
  }
  let result = "";
  let count = 0;
  for (var i = str?.length - 1; i >= 0; i--) {
    if (count % 3 == 0 && count != 0 && !isNaN(parseInt(str[i]))) result = "," + result;
    result = str[i] + result;
    count++;
  }
  return result + decimal;
}
export const commarNumberInput = (num) => {
  if (num > 0 && num < 0.000001) {
    return "0.00";
  }
  if (!num) {
    return "";
  }
  if (num > 0 && num < 0.000001) {
    return "0.00";
  }
  if (!num && num != 0) {
    return undefined;
  }
  let str = "";
  if (typeof num == "string") {
    str = num;
  } else {
    str = num.toString();
  }

  let decimal = "";
  if (str.includes(".")) {
    decimal = "." + str.split(".")[1].substring(0, 2);
    str = str.split(".")[0];
  } else {
    decimal = "";
  }
  if (str?.length <= 3) {
    return str + decimal;
  }
  let result = "";
  let count = 0;
  for (var i = str?.length - 1; i >= 0; i--) {
    if (count % 3 == 0 && count != 0 && !isNaN(parseInt(str[i]))) result = "," + result;
    result = str[i] + result;
    count++;
  }
  return result + decimal;
}
export const getDomain = () => {
  let domain = window.location.hostname;

  return domain();
}
export const getReturnUri = (navList) => {
  let dns_data = getLocalStorage('themeDnsData');
  dns_data = JSON.parse(dns_data);

  for (var i = 0; i < navList.length; i++) {
    if (dns_data?.setting_obj[`is_not_show_tab_${navList[i].id}`] != 1) {
      return navList[i].items[0].path
    }
  }
}
export const getUserLevelByNumber = (num) => {
  let dns_data = getLocalStorage('themeDnsData');
  dns_data = JSON.parse(dns_data);

  for (var i = 0; i < operatorLevelList.length; i++) {
    if (num == operatorLevelList[i].value) {
      if (dns_data?.level_obj[`sales${5 - i}_name`]?.includes('대리점')) {
        return '대리점';
      }
      return dns_data?.level_obj[`sales${5 - i}_name`]
    }
  }
  if (num == 0)
    return '일반유저'
  else if (num == 10)
    return '가맹점'
  else if (num == 40)
    return '본사'
  else if (num == 45)
    return '상위사'
  else if (num == 50)
    return '개발사'
  else
    return '잘못된레벨'
}
export const getUserStatusByNum = (num) => {
  if (num == 0)
    return '정상'
  else if (num == 1)
    return '가입대기'
  else if (num == 2)
    return '로그인금지'
  else
    return '잘못된상태'
}
export const useEditPageImg = (img_) => {
  try {
    let img = img_ ? img_[0] : '';
    if (typeof img == 'string') {
      img = '';
    }

    return img;
  } catch (err) {
    console.log(err);

    return '';
  }
}
export const processCatch = async (err) => {
  toast.error(err?.response?.data?.message || err?.message);
  let push_link = '';
  if (err?.response?.status == 401) {
    await deleteLocalStorage(LOCALSTORAGE.USER_DATA);
    push_link = `/${window.location.pathname.split('/')[1]}/login`;
  }
  if (err?.response?.status == 403) {
    push_link = `/${window.location.pathname.split('/')[1]}/login`;
  }
  return push_link
}

export function base64toFile(base_data, filename) {
  var arr = base_data.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}
export const getBackgroundColor = (theme) => {
  if (theme.palette.mode == 'dark') {
    return '#2f3349';
  } else {
    return '#fff';
  }
}
export const handleLogout = async (router, link_) => {
  let link = link_ ?? '/';
  try {
    const response = await axiosIns().post('/api/v1/auth/sign-out', {
      headers: {
        "Authorization": `Bearer ${getCookie('o')}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      }
    });
    if (response?.status == 200) {
      await deleteCookie('o');
      await deleteLocalStorage(LOCALSTORAGE.USER_DATA);
      router.push(link);
    }
  } catch (err) {
    //toast.error(err?.response?.data?.message || err?.message);
    if ([401, 403, 409].includes(err?.response?.status)) {
      await deleteCookie('o');
      await deleteLocalStorage(LOCALSTORAGE.USER_DATA);
      router.push(link);
    }
  }
}
export const getNumberByPercent = (num = 0, percent = 0) => {
  return Math.round(num * (percent).toFixed(2) / 100);
}
export function getLocation() {
  if (navigator.geolocation) {
    // GPS를 지원하면
    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        function (error) {
          console.error(error);
          resolve({
            latitude: 36.48509,
            longitude: 127.30035,
          });
        },
        {
          enableHighAccuracy: false,
          maximumAge: 0,
          timeout: Infinity,
        },
      );
    }).then(async coords => {
      return coords;
    });
  }
  console.info('GPS를 지원하지 않습니다');
  return {
    latitude: 36.48509,
    longitude: 127.30035,
  };
}
export const dateMinus = (s_dt, e_dt) => {//두날짜의 시간차 s_dt - e_dt //포맷:0000-00-00

  let f_d = new Date(s_dt).getTime();
  let s_d = new Date(e_dt).getTime();
  let hour = (f_d - s_d) / (1000 * 3600);
  let minute = (f_d - s_d) / (1000 * 60);
  let day = (f_d - s_d) / (1000 * 3600 * 24);

  return day;
}
export const getKakaoInfo = () => {
  let KAKAO_CLIENT_ID = `73b89581dcdc34aea90a3e61cdc168e2`;
  let KAKAO_REDIRECT_URI = `${window.location.origin}`;
  let KAKAO_AUTH_URL = ``;
  return {
    KAKAO_CLIENT_ID: KAKAO_CLIENT_ID,
    KAKAO_REDIRECT_URI: KAKAO_REDIRECT_URI,
    KAKAO_AUTH_URL: KAKAO_AUTH_URL,
  }
}

export const detetimeFormat = (datetime) => {
  return `${datetime.substring(0, 4)}년 ${datetime.substring(5, 7)}월 ${datetime.substring(8, 10)}일 ${datetime.substring(11, 19)}`
}
import { useEffect, useState } from 'react'
import { operatorLevelList } from "./format";
import navConfig from "src/layouts/manager/nav/config-navigation";

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

export default function useCountNum(end, start = 0, duration = 2000) {
  const [count, setCount] = useState(start)
  const frameRate = 1000 / 60
  const totalFrame = Math.round(duration / frameRate)

  useEffect(() => {
    let currentNumber = start
    const counter = setInterval(() => {
      const progress = easeOutExpo(++currentNumber / totalFrame)
      setCount(Math.round(end * progress))

      if (progress === 1) {
        clearInterval(counter)
      }
    }, frameRate)
  }, [end, frameRate, start, totalFrame])

  return count
}
export const isPc = () => {
  return window.innerWidth > 1000;
}
export function getAllIdsWithParents(categories) {
  const result = [];
  function traverseCategories(category, parentIds = []) {
    const idsWithParents = [...parentIds, category];
    result.push(idsWithParents);

    if (category.children && category.children.length > 0) {
      for (const child of category.children) {
        traverseCategories(child, idsWithParents);
      }
    }
  }
  for (const category of categories) {
    traverseCategories(category);
  }
  return result;
}
export function hexToRgb(hex) {
  // hex 값의 # 기호를 제거합니다.
  hex = hex.replace("#", "");

  // hex 값을 R, G, B로 나눕니다.
  var r = parseInt(hex.substring(0, 2), 16);
  var g = parseInt(hex.substring(2, 4), 16);
  var b = parseInt(hex.substring(4, 6), 16);

  // RGB 값을 객체로 반환합니다.
  return { r, g, b };
}
export const isManagerRouter = (router) => {
  return router.asPath.split('/')[1] == 'manager'
}
export const excelDownload = async (excelData, columns = [], param_table) => {
  const excelFileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const excelFileExtension = '.xlsx';
  const excelFileName = `${param_table}_${returnMoment().substring(0, 10).replaceAll('-', '')}`;
  let name_list = [];
  for (var i = 0; i < columns.length; i++) {
    name_list.push(columns[i]?.label)
  }

  let dns_data = await getLocalStorage(LOCALSTORAGE.DNS_DATA);
  dns_data = JSON.parse(dns_data);

  const ws = XLSX.utils.aoa_to_sheet([
    name_list
  ]);

  let result = [...excelData];

  await result.map(async (data, idx) => {
    XLSX.utils.sheet_add_aoa(
      ws,
      [
        data
      ],
      { origin: -1 }
    );
    ws['!cols'] = [
      { wpx: 50 },
      { wpx: 50 }
    ]

    return false;
  });
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
  const excelButter = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const excelFile = new Blob([excelButter], { type: excelFileType });
  FileSaver.saveAs(excelFile, excelFileName + excelFileExtension);
}
export const uploadExcel = async (e, id_name) => {
  return new Promise((resolve, reject) => {
    e.preventDefault();
    var files = e.target.files, f = files[0];
    var reader = new FileReader();
    reader.onload = async function (e) {
      let data = e.target.result;
      let readedData = XLSX.read(data, { type: 'binary' });
      let sheet_name = readedData.SheetNames[0];
      let sheets = readedData.Sheets[sheet_name];
      let list = XLSX.utils.sheet_to_json(sheets, { header: 1 });
      resolve(list);
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.readAsBinaryString(f);
    $(`#${id_name}`).val("");
  });
}
export const getUserFee = (item, user_level, operator_list = [], head_office_fee, is_oper_dns, dns_data,) => {
  let top_fee = head_office_fee;
  let level = 40;
  let result = 0;
  let oper_label = `sales`;
  if (is_oper_dns) {
    oper_label = `top_offer`;
  }
  if (level == 40 && dns_data?.is_use_fee_operator != 1) {
    return item?.mcht_fee - head_office_fee;
  }
  for (var i = 0; i < operator_list.length; i++) {
    if (item[`${oper_label}${operator_list[i].num}_id`] > 0) {
      if (user_level == level) {
        return (parseFloat(item[`${oper_label}${operator_list[i].num}_fee`] ?? 0) - parseFloat(top_fee)).toFixed(3);
      }
      top_fee = item[`${oper_label}${operator_list[i].num}_fee`];
      level = operator_list[i].value;
    }
  }
  if (user_level == level) {
    return (parseFloat(item[`${is_oper_dns ? `head_office_fee` : `mcht_fee`}`] ?? 0) - parseFloat(top_fee)).toFixed(3);
  }
  if (user_level == 10) {
    return (100 - parseFloat(item[`mcht_fee`] ?? 0)).toFixed(3);
  }
  return result;
}
export const getUserWithDrawFee = (item, user_level, operator_list = [], withdraw_head_office_fee, is_oper_dns, dns_data,) => {
  let top_fee = withdraw_head_office_fee;

  let level = 40;
  let result = 0;
  let oper_label = `sales`;
  if (is_oper_dns) {
    oper_label = `top_offer`;
  }
  if (level == 40 && dns_data?.is_use_withdraw_operator != 1) {
    return item?.withdraw_fee - withdraw_head_office_fee;
  }
  for (var i = 0; i < operator_list.length; i++) {
    if (item[`${oper_label}${operator_list[i].num}_id`] > 0) {
      if (user_level == level) {
        return (parseFloat(item[`${oper_label}${operator_list[i].num}_withdraw_fee`] ?? 0) - parseFloat(top_fee)).toFixed(3);
      }
      top_fee = item[`${oper_label}${operator_list[i].num}_withdraw_fee`];
      level = operator_list[i].value;
    }
  }
  if (user_level == level) {
    return (parseFloat(item[`${is_oper_dns ? `withdraw_head_office_fee` : `withdraw_fee`}`] ?? 0) - parseFloat(top_fee)).toFixed(3);
  }
  // if (user_level == 10) {
  //   return (100 - parseFloat(item[`withdraw_fee`] ?? 0)).toFixed(3);
  // }
  return result;
}
export const getUserDepositFee = (item, user_level, operator_list = [], deposit_head_office_fee, is_oper_dns, dns_data,) => {
  let top_fee = deposit_head_office_fee;

  let level = 40;
  let result = 0;
  let oper_label = `sales`;
  if (is_oper_dns) {
    oper_label = `top_offer`;
  }
  if (level == 40 && dns_data?.is_use_deposit_operator != 1) {
    return item?.deposit_fee - deposit_head_office_fee;
  }
  for (var i = 0; i < operator_list.length; i++) {
    if (item[`${oper_label}${operator_list[i].num}_id`] > 0) {
      if (user_level == level) {
        return (parseFloat(item[`${oper_label}${operator_list[i].num}_deposit_fee`] ?? 0) - parseFloat(top_fee)).toFixed(3);
      }
      top_fee = item[`${oper_label}${operator_list[i].num}_deposit_fee`];
      level = operator_list[i].value;
    }
  }
  if (user_level == level) {
    return (parseFloat(item[`${is_oper_dns ? `deposit_head_office_fee` : `deposit_fee`}`] ?? 0) - parseFloat(top_fee)).toFixed(3);
  }
  // if (user_level == 10) {
  //   return (100 - parseFloat(item[`withdraw_fee`] ?? 0)).toFixed(3);
  // }
  return result;
}
export const getMaxPage = (total = 0, page_size = 1) => {
  if (total == 0) {
    return 1;
  }
  if (total % parseInt(page_size) == 0) {
    return parseInt(total / parseInt(page_size));
  } else {
    return parseInt(total / parseInt(page_size)) + 1;
  }
}
export const onlyNumberText = (text_ = "") => {
  let text = text_;
  if (!text) {
    return "";
  }
  let str = "";
  for (var i = 0; i < text.length; i++) {
    if (!isNaN(parseInt(text[i]))) {
      str += text[i];
    }
  }
  return str;
}
export const getTableIdDuplicate = (list = []) => {
  let result = {};
  for (var i = 0; i < list.length; i++) {
    let dupl_list = list.filter(el => el?.id == list[i]?.id);
    if (dupl_list.length > 1) {
      result[list[i]?.id] = dupl_list.length;
    }
  }
  return result;
}
export const getFirstDateByMonth = (date_ = "") => {
  let date = date_.split('-');
  return `${date[0]}-${date[1]}-01`
}
export function generateRandomString(length = 1) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  return randomString;
}