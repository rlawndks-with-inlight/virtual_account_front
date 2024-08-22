import { getLocalStorage } from "src/utils/local-storage";


const GiftCardApiV1 = () => {

    let themeDnsData = getLocalStorage('themeDnsData');
    themeDnsData = JSON.parse(themeDnsData);

    const tab_list = [
        {
            value: 0,
            label: '휴대폰인증'
        },
        {
            value: 1,
            label: '휴대폰인증확인'
        },
        {
            value: 2,
            label: '출금계좌인증'
        },
        {
            value: 3,
            label: '출금계좌인증확인'
        },
        {
            value: 4,
            label: '상품권구매 입금계좌 발송'
        },
        {
            value: 5,
            label: '상품권사용전인증'
        },
        {
            value: 6,
            label: '상품권사용'
        },
    ]

    const table_obj = {
        0: {
            uri: '/api/gift/v1/phone/request',
            explain: `휴대폰인증 요청 api 입니다.`,
            req_head: [
                '키',
                '설명',
                '필수',
                '타입',
            ],
            req_body: [
                ['api_key', themeDnsData?.api_key, 'O', 'String'],
                ['mid', '가맹점 mid', 'O', 'String'],
                ['name', '이름', 'O', 'String'],
                ['birth', '생년월일 ex) 19990101', 'O', 'String'],
                ['acct_back_one_num', '주민번호 뒷자리 첫번째 숫자', 'O', 'String'],
                ['tel_com', '통신사 (왼쪽이 통신시 사용될 값) (SK-SKT, KT-KT, LG-LGU+, SK_MVNO-알뜰폰SKT, KT_MVNO-알뜰폰KT, LG_MVNO-알뜰폰LGU)', 'O', 'String'],
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
                ['tid', '요청 tid', 'String'],
            ],
        },
        1: {
            uri: '/api/gift/v1/phone/check',
            explain: `휴대폰인증 확인 api 입니다.`,
            req_head: [
                '키',
                '설명',
                '필수',
                '타입',
            ],
            req_body: [
                ['api_key', themeDnsData?.api_key, 'O', 'String'],
                ['mid', '가맹점 mid', 'O', 'String'],
                ['tid', '요청 tid', 'O', 'String'],
                ['phone_vrf_word', '인증번호', 'O', 'String'],
                ['phone_num', '휴대폰번호 하이픈(-)제외', 'O', 'String'],
                ['name', '이름', 'O', 'String'],
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
                ['ci', '유저 고유 인증값', 'String'],
            ],
        },
        2: {
            uri: '/api/gift/v1/acct/request',
            explain: `출금계좌 인증요청 api 입니다.`,
            req_head: [
                '키',
                '설명',
                '필수',
                '타입',
            ],
            req_body: [
                ['api_key', themeDnsData?.api_key, 'O', 'String'],
                ['mid', '가맹점 mid', 'O', 'String'],
                ['ci', '유저 고유 인증값', 'O', 'String'],
                ['deposit_bank_code', '출금받을 은행 코드', 'O', 'String'],
                ['deposit_acct_num', '출금받을 은행 계좌번호', 'O', 'String'],
                ['name', '이름 (예금주명=휴대폰인증시 사용한 이름과 일치 해야함)', 'O', 'String'],
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
                ['tid', '요청 tid', 'String'],
                ['guid', '회원 전용 guid', 'String'],

            ],
        },
        3: {
            uri: '/api/gift/v1/acct/check',
            explain: `출금계좌 인증확인 api 입니다. 휴대폰인증 완료후 가능합니다.`,
            req_head: [
                '키',
                '설명',
                '필수',
                '타입',
            ],
            req_body: [
                ['api_key', themeDnsData?.api_key, 'O', 'String'],
                ['mid', '가맹점 mid', 'O', 'String'],
                ['tid', '요청 tid', 'O', 'String'],
                ['vrf_word', '인증번호', 'O', 'String'],
                ['guid', '회원 전용 guid', 'O', 'String'],
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
        },
        4: {
            uri: '/api/gift/v1/gift/order',
            explain: `상품권 구매요청 api 입니다.\n등록된 휴대폰번호로 인증이 발송됩니다.\n출금계좌인증 완료 후 이용 가능합니다.`,
            req_head: [
                '키',
                '설명',
                '필수',
                '타입',
            ],
            req_body: [
                ['api_key', themeDnsData?.api_key, 'O', 'String'],
                ['guid', '회원 전용 guid', 'O', 'String'],
                ['gift_price', '구매금액단위 (1-일만원권, 5-오만원권, 10-십만원권, 30-삼십만원권, 50-오십만원권)', 'O', 'String'],
                ['gift_count', '구매수량 (1~6까지)', 'O', 'Integer'],
                ['is_agree_order', '주문동의여부 (1-동의,0-비동의)', 'O', 'String'],
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
        },
        5: {
            uri: '/api/gift/v1/gift/auth',
            explain: `상품권사용 전 인증요청 api 입니다.\n등록된 휴대폰번호로 인증이 발송됩니다.`,
            req_head: [
                '키',
                '설명',
                '필수',
                '타입',
            ],
            req_body: [
                ['api_key', themeDnsData?.api_key, 'O', 'String'],
                ['guid', '회원 전용 guid', 'O', 'String'],
                ['gift_num', '상품권번호 (받은 번호 그대로 다 입력 (-)포함)', 'O', 'Integer'],
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
        },
        6: {
            uri: '/api/gift/v1/gift/use',
            explain: `상품권사용전 인증확인 및 사용 api 입니다.`,
            req_head: [
                '키',
                '설명',
                '필수',
                '타입',
            ],
            req_body: [
                ['api_key', themeDnsData?.api_key, 'O', 'String'],
                ['guid', '회원 전용 guid', 'O', 'String'],
                ['gift_num', '상품권번호 (받은 번호 그대로 다 입력 (-)포함)', 'O', 'Integer'],
                ['vrf_word', '인증번호', 'O', 'String'],
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
        },

    }
    return {
        tab_list,
        table_obj,
        tab_key: 'virtual_acctv1'
    }

}
export default GiftCardApiV1;