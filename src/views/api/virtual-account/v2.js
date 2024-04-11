import { getLocalStorage } from "src/utils/local-storage";

const VirtualAccountApiV2 = () => {

    let themeDnsData = getLocalStorage('themeDnsData');
    themeDnsData = JSON.parse(themeDnsData);

    const tab_list = [
        {
            value: 0,
            label: '입금계좌인증요청'
        },
        {
            value: 1,
            label: '입금계좌인증'
        },
        {
            value: 2,
            label: '문자인증요청'
        },
        {
            value: 3,
            label: '문자인증확인'
        },
        {
            value: 4,
            label: '가상계좌발급'
        },
    ]

    const table_obj = {
        0: {
            uri: '/api/acct/v2/account',
            explain: `입금계좌 인증 요청 api 입니다.`,
            req_head: [
                '키',
                '설명',
                '필수',
                '타입',
            ],
            req_body: [
                ['api_key', themeDnsData?.api_key, 'O', 'String'],
                ['mid', '가맹점 mid', 'O', 'String'],
                ['bank_code', '입금은행코드', 'O', 'String'],
                ['account', '입금계좌번호', 'O', 'String'],
                ['name', '예금주명', 'O', 'String'],

            ],
            res_head: [
                '키',
                '설명',
                '타입',
            ],
            res_body: [
                ['result', '결과코드 (100 이외 에러)', 'Integer'],
                ['message', '결과 메시지', 'String'],
                ['data', '리턴값', 'Object'],
            ],
            data_res_body: [
                ['verify_tr_no', '발급된 거래번호', 'String'],
                ['verify_tr_dt', '발급된 거래날짜', 'String'],
            ],
        },
        1: {
            uri: '/api/acct/v2/account/check',
            explain: `입금계좌 인증 확인 api 입니다.`,
            req_head: [
                '키',
                '설명',
                '필수',
                '타입',
            ],
            req_body: [
                ['api_key', themeDnsData?.api_key, 'O', 'String'],
                ['mid', '가맹점 mid', 'O', 'String'],
                ['vrf_word', '인증번호', 'O', 'String'],
                ['verify_tr_no', '발급된 거래번호', 'O', 'String'],
                ['verify_tr_dt', '발급된 거래날짜', 'O', 'String'],
            ],
            res_head: [
                '키',
                '설명',
                '타입',
            ],
            res_body: [
                ['result', '결과코드 (100 이외 에러)', 'Integer'],
                ['message', '결과 메시지', 'String'],
                ['data', '리턴값', 'Object'],
            ],
            data_res_body: [
                ['is_check', '완료일시 1', 'String'],
            ],
        },
        2: {
            uri: '/api/acct/v2/sms',
            explain: `문자 인증 요청 api 입니다.`,
            req_head: [
                '키',
                '설명',
                '필수',
                '타입',
            ],
            req_body: [
                ['api_key', themeDnsData?.api_key, 'O', 'String'],
                ['mid', '가맹점 mid', 'O', 'String'],
                ['gender', '성별 (M-남자,F-여자)', 'O', 'String'],
                ['ntv_frnr', '내외국인 (L-내국인,F-외국인)', 'O', 'String'],
                ['birth', '생년월일 ex) 19990101', 'O', 'String'],
                ['tel_com', '통신사 (01-SKT, 02-KT, 03-LGU+, 04-알뜰폰SKT, 05-알뜰폰KT, 06-알뜰폰LGU)', 'O', 'String'],
                ['phone_num', '휴대폰번호 하이픈(-)제외', 'O', 'String'],
                ['verify_tr_no', '발급된 거래번호', 'O', 'String'],
                ['verify_tr_dt', '발급된 거래날짜', 'O', 'String'],
            ],
            res_head: [
                '키',
                '설명',
                '타입',
            ],
            res_body: [
                ['result', '결과코드 (100 이외 에러)', 'Integer'],
                ['message', '결과 메시지', 'String'],
                ['data', '리턴값', 'Object'],
            ],
            data_res_body: [
                ['tx_seq_no', '문자인증에 사용될 거래번호', 'String'],
            ],
        },
        3: {
            uri: '/api/acct/v2/sms/check',
            explain: `문자 인증 확인 api 입니다.`,
            req_head: [
                '키',
                '설명',
                '필수',
                '타입',
            ],
            req_body: [
                ['api_key', themeDnsData?.api_key, 'O', 'String'],
                ['mid', '가맹점 mid', 'O', 'String'],
                ['tx_seq_no', '문자인증에 사용될 거래번호', 'O', 'String'],
                ['phone_vrf_word', '문자인증번호', 'O', 'String'],
                ['verify_tr_no', '발급된 거래번호', 'O', 'String'],
                ['verify_tr_dt', '발급된 거래날짜', 'O', 'String'],
            ],
            res_head: [
                '키',
                '설명',
                '타입',
            ],
            res_body: [
                ['result', '결과코드 (100 이외 에러)', 'Integer'],
                ['message', '결과 메시지', 'String'],
                ['data', '리턴값', 'Object'],
            ],
            data_res_body: [
                ['is_check', '완료일시 1', 'String'],
            ],
        },
        4: {
            uri: '/api/acct/v2/issuance',
            explain: `가상계좌발급 api 입니다.\n앞에 4개를 순서대로 진행후 이용 가능합니다.`,
            req_head: [
                '키',
                '설명',
                '필수',
                '타입',
            ],
            req_body: [
                ['api_key', themeDnsData?.api_key, 'O', 'String'],
                ['mid', '가맹점 mid', 'O', 'String'],
                ['verify_tr_no', '발급된 거래번호', 'O', 'String'],
                ['verify_tr_dt', '발급된 거래날짜', 'O', 'String'],
            ],
            res_head: [
                '키',
                '설명',
                '타입',
            ],
            res_body: [
                ['result', '결과코드 (100 이외 에러)', 'Integer'],
                ['message', '결과 메시지', 'String'],
                ['data', '리턴값', 'Object'],
            ],
            data_res_body: [
                ['bank_code', '가상계좌 은행코드', 'String'],
                ['virtual_acct_num', '가상계좌번호', 'String'],
            ],
        },
    }

    return {
        tab_list,
        table_obj,
        tab_key: 'virtual_acctv2'
    }
}
export default VirtualAccountApiV2;