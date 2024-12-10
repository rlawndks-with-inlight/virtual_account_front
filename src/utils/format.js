import { getLocalStorage } from "./local-storage"

export const userLevelList = [
    { value: 50, label: '개발사' },
    { value: 45, label: '상위사' },
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
export const bankCodeList = (pay_type = 'deposit') => {
    let dns_data = getLocalStorage('themeDnsData');
    dns_data = JSON.parse(dns_data);
    return dns_data?.bank_list[pay_type];
}

export const apiCorpList = [
    { value: 1, label: '뱅크너스' },
    { value: 2, label: '쿠콘' },
    { value: 3, label: '페이투스' },
    { value: 4, label: '더즌' },
    { value: 5, label: '헥토파이낸셜' },
    { value: 6, label: '코리아결제시스템' },
    { value: 7, label: 'ICB' },
]
export const virtualAccountStatusList = [
    { value: 0, label: '정상', color: 'success' },
    { value: 5, label: '생성중', color: 'warning' },
    { value: 10, label: '사용불가', color: 'error' },
]
export const giftCardMemberStatusList = [
    { value: 0, label: '본인인증중', color: 'error' },
    { value: 1, label: '출금계좌인증중', color: 'warning' },
    { value: 2, label: '정상', color: 'success' },
]
export const withdrawHandList = [
    { value: 0, label: '노티', color: 'info' },
    { value: 1, label: '수기', color: 'warning' },
]
export const payTypeList = [
    { value: 0, label: '입금', color: 'success', level: 10, },
    { value: 5, label: '출금', color: 'error', level: 10, },
    { value: 10, label: '모계좌출금', color: 'info', level: 40, },
    { value: 12, label: '모계좌삭감', color: 'error', level: 40, },
    { value: 15, label: '회원 -> 모계좌이체', color: 'warning', level: 40, },
    { value: 20, label: '반환', color: 'warning', level: 10, },
    { value: 25, label: '관리자 지급', color: 'info', level: 10, },
    { value: 30, label: '관리자 차감', color: 'warning', level: 10, },
]
export const withdrawStatusList = [
    { value: 0, label: '출금완료', color: 'success' },
    { value: 5, label: '출금요청완료', color: 'warning' },
    { value: 10, label: '출금실패', color: 'error' },
    { value: 15, label: '출금반려', color: 'error' },
    { value: 20, label: '출금대기', color: 'warning' },
]
export const depositStatusList = [
    { value: 0, label: '입금완료', color: 'success' },
    { value: 5, label: '입금요청완료', color: 'warning' },
    { value: 10, label: '주의건', color: 'error' },
    { value: 20, label: '입금대기', color: 'warning' },
]
export const virtualAccountUserTypeList = [
    { value: 0, label: '개인', color: 'success' },
    { value: 1, label: '법인', color: 'success' },
    { value: 2, label: '개인사업자', color: 'success' },
]
export const withdrawTypeList = [
    { value: 0, label: 'guid 설정 출금방식', color: 'success' },
    { value: 1, label: '직접설정출금방식', color: 'success' },
]
export const withdrawFeeTypeList = [
    { value: 0, label: '추가형식 (감소정산금: 출금액 + 출금수수료)', color: 'success' },
    { value: 1, label: '감소형식 (감소정산금: 출금액)', color: 'success' },
]
export const genderList = [
    { label: '남자', value: 'M' },
    { label: '여자', value: 'F' },
]
export const ntvFrnrList = [
    { label: '내국인', value: 'L' },
    { label: '외국인', value: 'F' },

]
export const virtualAcctLinkStatusList = [
    { label: '정상', value: 0 },
    { label: '차단', value: 1 },

]
export const telComList = [
    { label: 'SKT', value: '01', labelValue: 'SK', },
    { label: 'KT', value: '02', labelValue: 'KT', },
    { label: 'LGU+', value: '03', labelValue: 'LG', },
    { label: '알뜰폰SKT', value: '04', labelValue: 'SK_MVNO', },
    { label: '알뜰폰KT', value: '05', labelValue: 'KT_MVNO', },
    { label: '알뜰폰LGU', value: '06', labelValue: 'LG_MVNO', },
]