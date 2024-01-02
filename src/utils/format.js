import { getLocalStorage } from "./local-storage"

export const userLevelList = [
    { value: 50, label: '개발사' },
    { value: 40, label: '본사' },

    { value: 30, label: '' },
    { value: 25, label: '' },
    { value: 20, label: '' },
    { value: 17, label: '' },
    { value: 15, label: '' },
    { value: 13, label: '' },

    { value: 0, label: '일반유저' },
]
export const operatorLevelList = [
    { value: 30, label: '' },
    { value: 25, label: '' },
    { value: 20, label: '' },
    { value: 17, label: '' },
    { value: 15, label: '' },
    { value: 13, label: '' },
]
export const bankCodeList = () => {
    let dns_data = getLocalStorage('themeDnsData');
    dns_data = JSON.parse(dns_data);
    if (dns_data?.bank_list) {
        return dns_data?.bank_list;
    } else {
        return [
            { value: '001', label: '한국은행', },
            { value: '002', label: '산업은행', },
            { value: '003', label: '기업은행', },
            { value: '004', label: 'KB국민은행', },
            { value: '007', label: '수협은행', },
            { value: '008', label: '수출입은행', },
            { value: '011', label: 'NH농협은행', },
            { value: '012', label: '농축협(단위)', },
            { value: '020', label: '우리은행', },
            { value: '023', label: 'SC제일은행', },
            { value: '027', label: '한국씨티', },
            { value: '031', label: '대구은행', },
            { value: '032', label: '부산은행', },
            { value: '034', label: '광주은행', },
            { value: '035', label: '제주은행', },
            { value: '037', label: '전북은행', },
            { value: '039', label: '경남은행', },
            { value: '045', label: '새마을금고중앙회', },
            { value: '048', label: '신협중앙회', },
            { value: '050', label: '저축은행', },
            { value: '064', label: '산림조합중앙회', },
            { value: '071', label: '우체국', },
            { value: '081', label: '하나은행', },
            { value: '088', label: '신한은행', },
            { value: '089', label: '케이뱅크', },
            { value: '090', label: '카카오뱅크', },
            { value: '092', label: '토스뱅크', },
            { value: '105', label: '웰컴저축은행' },
        ]
    }
}

export const apiCorpList = [
    { value: 1, label: '뱅크너스' },
    { value: 2, label: '쿠콘' },
]
export const virtualAccountStatusList = [
    { value: 0, label: '정상', color: 'success' },
    { value: 5, label: '생성중', color: 'warning' },
]
export const payTypeList = [
    { value: 0, label: '입금' },
    { value: 5, label: '출금' },
    { value: 10, label: '모계좌출금' },
    { value: 15, label: '가맹점 -> 모계좌이체' },
]
export const withdrawStatusList = [
    { value: 0, label: '출금완료', color: 'success' },
    { value: 5, label: '출금요청완료', color: 'warning' },
]
