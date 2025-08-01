import { toast } from "react-hot-toast";
import axios from "./axios";
import { serialize } from 'object-to-formdata';
import { getLocalStorage } from "./local-storage";
import { when } from "jquery";

export const post = async (url, obj) => {
    try {
        let formData = new FormData();
        let form_data_options = {
            indices: true,
        }
        formData = serialize(obj, form_data_options);
        let config = {
            headers: {
                'Content-Type': "application/json",
            }
        };
        const { data: response } = await axios.post(url, formData, config);
        if (response?.result > 0) {
            return response?.data;
        } else {
            toast.error(response?.message);
            return false;
        }
    } catch (err) {
        console.log(err)
        toast.error(err?.message);
        if (err?.rate_limiter) {
            toast.error('너무 많은 요청을 하였습니다. 잠시 후 이용해 주세요.');
        }
        return false;
    }
}
export const postReturn = async (url, obj) => {
    try {
        let formData = new FormData();
        let form_data_options = {
            indices: true,
        }
        formData = serialize(obj, form_data_options);
        let config = {
            headers: {
                'Content-Type': "application/json",
            }
        };
        const { data: response } = await axios.post(url, formData, config);
        if (response?.result > 0) {
            return response?.data;
        } else {
            toast.error(response?.message);
            return response?.data;
        }
    } catch (err) {
        console.log(err)
        toast.error(err?.message);
        if (err?.rate_limiter) {
            toast.error('너무 많은 요청을 하였습니다. 잠시 후 이용해 주세요.');
        }
        return false;
    }
}
export const deleteItem = async (url, obj) => {
    try {
        const { data: response } = await axios.delete(url, obj);
        if (response?.result > 0) {
            return response?.data;
        } else {
            toast.error(response?.message);
            return false;
        }
    } catch (err) {
        console.log(err)
        toast.error(err?.response?.data?.message || err?.message);
        if (err?.rate_limiter) {
            toast.error('너무 많은 요청을 하였습니다. 잠시 후 이용해 주세요.');
        }
        return false;
    }
}
export const put = async (url, obj) => {
    try {
        let formData = new FormData();
        let form_data_options = {
            indices: true,
        }
        formData = serialize(obj, form_data_options);
        let config = {
            headers: {
                'Content-Type': "application/json",
            }
        };
        const { data: response } = await axios.put(url, formData, config);
        if (response?.result > 0) {
            return response?.data;
        } else {
            toast.error(response?.message);
            return false;
        }
    } catch (err) {
        console.log(err)
        toast.error(err?.message);
        if (err?.rate_limiter) {
            toast.error('너무 많은 요청을 하였습니다. 잠시 후 이용해 주세요.');
        }
        return false;
    }
}
export const get = async (url, params) => {
    try {
        let query = new URLSearchParams(params).toString()

        const { data: response } = await axios.get(`${url}?${query}`);

        if (response?.result > 0) {
            return response?.data;
        } else {
            toast.error(response?.message);
            return false;
        }
    } catch (err) {
        console.log(err)
        if (err?.rate_limiter) {
            toast.error('너무 많은 요청을 하였습니다. 잠시 후 이용해 주세요.');
        }
        return false;
    }
}
export const apiManager = (table, type, params) => {
    let obj = settingParams(table, type, params);
    if (!(obj?.brand_id > 0)) {
        let dns_data = getLocalStorage('themeDnsData');
        dns_data = JSON.parse(dns_data);
        obj['brand_id'] = dns_data?.id;
    }
    let base_url = '/api';
    if (type == 'get') {
        return get(`${base_url}/${table}/${params?.id ?? ""}`);
    }
    if (type == 'list') {
        return get(`${base_url}/${table}`, obj);
    }
    if (type == 'create') {
        return post(`${base_url}/${table}`, obj);
    }
    if (type == 'update') {
        return put(`${base_url}/${table}/${params?.id ?? ""}`, obj);
    }
    if (type == 'delete') {
        console.log(obj)
        return deleteItem(`${base_url}/${table}/${params?.id}?${new URLSearchParams(obj).toString()}`, obj);
    }
}
export const apiUtil = async (table, type, params) => {
    let obj = await settingParams(table, type, params);
    if (!(obj?.brand_id > 0)) {
        let dns_data = getLocalStorage('themeDnsData');
        dns_data = JSON.parse(dns_data);
        obj['brand_id'] = dns_data?.id;
        obj['root_id'] = dns_data?.root_id;
    }
    let base_url = '/api/util';
    if (type == 'get') {
        return get(`${base_url}/${table}`, obj);
    }
    if (type == 'update') {
        return post(`${base_url}/${table}`, obj);
    }
}
export const apiServer = (url, type, params) => {
    let obj = settingParams("", type, params);
    if (!(obj?.brand_id > 0)) {
        let dns_data = getLocalStorage('themeDnsData');
        dns_data = JSON.parse(dns_data);
        obj['brand_id'] = dns_data?.id;
    }
    if (type == 'get') {
        return get(`${url}`);
    }
    if (type == 'create') {
        return postReturn(`${url}`, obj);
    }

}
export const uploadMultipleFiles = async (files = []) => {
    try {
        let result = undefined;
        let result_list = [];
        for (var i = 0; i < files.length; i++) {
            result_list.push(apiManager('upload/single', 'create', {
                post_file: files[i],
            }));
        }
        for (var i = 0; i < result_list.length; i++) {
            await result_list[i];
        }
        result = (await when(result_list));
        let list = [];
        for (var i = 0; i < (await result).length; i++) {
            list.push(await result[i]);
        }
        return list;
    } catch (err) {
        toast.error('파일 등록중 에러')
        return [];
    }
}
const settingdeleteImageObj = (obj_) => {//이미지 존재안할시 삭제함
    let obj = obj_;
    let keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
        if (keys[i].slice(-5) == '_file') {
            if (!obj[keys[i]]) {
                delete obj[keys[i]];
            }
        }
    }
    return obj;
}
export const settingParams = (table, type, params) => {
    let obj = { ...params };
    let keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
        let key = keys[i];
        if (!obj[key] && typeof obj[key] != 'number') {
            delete obj[key];
        }
    }
    if (type == 'create') {
        obj = settingdeleteImageObj(obj);
    }
    if (type == 'update') {
        obj = settingdeleteImageObj(obj);
    }
    if (type == 'delete') {
        obj = settingdeleteImageObj(obj);
    }
    return obj
}