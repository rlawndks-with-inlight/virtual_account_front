import { getLocalStorage } from "src/utils/local-storage";


const VirtualAccountApiV1 = () => {

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
            label: '가상계좌발급'
        },
        {
            value: 3,
            label: '출금요청'
        },
        {
            value: 4,
            label: '입금데이터노티'
        },
    ]

    const table_obj = {
        0: {
            uri: '/api/acct/v1',
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
                ['name', '이름', 'O', 'String'],
                ['birth', '생년월일 ex) 19990101', 'O', 'String'],
                ['phone_num', '휴대폰번호 하이픈(-)제외', 'O', 'String'],
                ['user_type', '0-개인, 1-법인, 2-개인사업자', 'O', 'Integer'],
                ['business_num', '사업자등록번호 (user_type이 1 또는 2일시 필수)', 'X', 'String'],
                ['company_name', '회사명(상호) (user_type이 1 또는 2일시 필수)', 'X', 'String'],
                ['ceo_name', '대표자명 (user_type이 1 또는 2일시 필수)', 'X', 'String'],
                ['company_phone_num', '회사 전화번호 (user_type이 1 또는 2일시 필수)', 'X', 'String'],
                ...(themeDnsData?.is_use_sign_key == 1 ? [
                    ['api_sign_val', 'API signature 값\n서명값생성: SHA256(api_key + mid + sign_key)', 'O', 'String'],
                ] : []),
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
        1: {
            uri: '/api/acct/v1/check',
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
                ['tid', '입금은행 1원인증 요청 tid', 'O', 'String'],
                ['vrf_word', '인증번호', 'O', 'String'],
                ['guid', '생성된유저 guid', 'O', 'String'],
                ...(themeDnsData?.is_use_sign_key == 1 ? [
                    ['api_sign_val', 'API signature 값\n서명값생성: SHA256(api_key + mid + sign_key)', 'O', 'String'],
                ] : []),
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
                ['tid', '1원인증완료 tid', 'String'],
            ],
        },
        2: {
            uri: '/api/acct/v1/issuance',
            explain: `가상계좌 요청 api 입니다.\n입금계좌인증 완료 후 이용 가능합니다.`,
            req_head: [
                '키',
                '설명',
                '필수',
                '타입',
            ],
            req_body: [
                ['api_key', themeDnsData?.api_key, 'O', 'String'],
                ['mid', '가맹점 mid', 'O', 'String'],
                ['guid', '생성된유저 guid', 'O', 'String'],
                ...(themeDnsData?.is_use_sign_key == 1 ? [
                    ['api_sign_val', 'API signature 값\n서명값생성: SHA256(api_key + mid + sign_key)', 'O', 'String'],
                ] : []),
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
                ['bank_id', '가상계좌 은행코드', 'String'],
                ['virtual_acct_num', '가상계좌번호', 'String'],
                ['virtual_acct_name', '가상계좌명', 'String'],
                ['tid', '가상계좌발급 tid', 'String'],

            ],
        },
        3: {
            uri: '/api/withdraw/v2',
            explain: `출금 요청 api 입니다.\n입금계좌인증 완료 후 이용 가능합니다.`,
            req_head: [
                '키',
                '설명',
                '필수',
                '타입',
            ],
            req_body: [
                ['api_key', themeDnsData?.api_key, 'O', 'String'],
                ['mid', '가맹점 mid', 'O', 'String'],
                ['guid', '출금할 가상계좌 guid', 'O', 'String'],
                ['withdraw_amount', '출금액', 'O', 'Integer'],
                ['pay_type', '출금타입 (가맹점출금-withdraw, 유저출금-return)', 'O', 'String'],
                ...(themeDnsData?.is_use_sign_key == 1 ? [
                    ['api_sign_val', 'API signature 값\n서명값생성: SHA256(api_key + mid + sign_key)', 'O', 'String'],
                ] : []),
                ...(themeDnsData?.is_use_otp == 1 ? [
                    ['otp_num', 'otp 값', 'O', 'String'],
                ] : []),
                ['note', '메모', 'X', 'String'],
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
        4: {
            uri: '',
            explain: `입금데이터노티 입니다. 응답주실때 0000-성공, 9999-실패로 판단합니다.`,
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
                ['tid', '거래번호', 'String'],
                ...(themeDnsData?.is_use_sign_key == 1 ? [
                    ['api_sign_val', 'API signature 값\n서명값생성: SHA256(api_key + mid + sign_key)', 'String'],
                ] : []),
            ],

        },
    }
    return {
        tab_list,
        table_obj,
        tab_key: 'virtual_acctv1'
    }

}
export default VirtualAccountApiV1;