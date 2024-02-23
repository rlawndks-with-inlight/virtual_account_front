import { getLocalStorage } from "src/utils/local-storage";


const DepositApiV1 = () => {

    let themeDnsData = getLocalStorage('themeDnsData');
    themeDnsData = JSON.parse(themeDnsData);

    const tab_list = [
        {
            value: 0,
            label: '1원인증요청'
        },
        {
            value: 1,
            label: '1원인증확인'
        },
        {
            value: 2,
            label: '입금데이터추가'
        },
        {
            value: 3,
            label: '입금데이터노티'
        },
    ]

    const table_obj = {
        0: {
            uri: '/api/auth/v1/account/request',
            explain: `1원인증요청 api 입니다.`,
            req_head: [
                '키',
                '설명',
                '필수',
                '타입',
            ],
            req_body: [
                ['api_key', themeDnsData?.api_key, 'O', 'String'],
                ['mid', '가맹점 mid', 'O', 'String'],
                ['deposit_bank_code', '입금은행코드', 'O', 'String'],
                ['deposit_acct_num', '입금계좌번호', 'O', 'String'],
                ['deposit_acct_name', '입금예금주명', 'O', 'String'],
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
                ['mcht_trd_no', '거래번호', 'String'],
                ['mcht_cust_id', '고객번호', 'String'],
            ],
        },
        1: {
            uri: '/api/auth/v1/account/check',
            explain: `1원인증확인 api 입니다.`,
            req_head: [
                '키',
                '설명',
                '필수',
                '타입',
            ],
            req_body: [
                ['api_key', themeDnsData?.api_key, 'O', 'String'],
                ['mid', '가맹점 mid', 'O', 'String'],
                ['mcht_trd_no', '요청시 받은 거래번호', 'O', 'String'],
                ['mcht_cust_id', '요청시 받은 고객번호', 'O', 'String'],
                ['vrf_word', '인증번호', 'O', 'String'],
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
        },
        2: {
            uri: '/api/deposit/v1',
            explain: `입금데이터추가 api 입니다.`,
            req_head: [
                '키',
                '설명',
                '필수',
                '타입',
            ],
            req_body: [
                ['api_key', themeDnsData?.api_key, 'O', 'String'],
                ['mid', '가맹점 mid', 'O', 'String'],
                ['amount', '금액', 'O', 'Integer'],
                ['deposit_bank_code', '입금은행코드', 'O', 'String'],
                ['deposit_acct_num', '입금계좌번호', 'O', 'String'],
                ['deposit_acct_name', '입금예금주명', 'O', 'String'],
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
                ['guid', '생성된유저 guid', 'String'],
                ['tid', '입금은행 1원인증 요청 tid', 'String'],
            ],
        },
        3: {
            uri: '',
            explain: `입금데이터노티 api 입니다.`,
            res_head: [
                '키',
                '설명',
                '타입',
            ],
            res_body: [
                ['amount', '입금액', 'Integer'],
                ['bank_code', '입금은행코드', 'String'],
                ['acct_num', '입금계좌번호', 'String'],
                ['acct_name', '입금자명', 'String'],
            ],

        },
    }
    return {
        tab_list,
        table_obj,
        tab_key: 'depositv1'
    }

}
export default DepositApiV1;