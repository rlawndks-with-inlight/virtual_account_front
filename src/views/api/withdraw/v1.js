import { getLocalStorage } from "src/utils/local-storage";

const WithdrawApiV1 = () => {

    let themeDnsData = getLocalStorage('themeDnsData');
    themeDnsData = JSON.parse(themeDnsData);

    const tab_list = [
        {
            value: 0,
            label: '출금요청'
        },

    ]

    const table_obj = {
        0: {
            uri: '/api/withdraw/v1',
            explain: `출금 요청 api 입니다.`,
            req_head: [
                '키',
                '설명',
                '필수',
                '타입',
            ],
            req_body: [
                ['api_key', themeDnsData?.api_key, 'O', 'String'],
                ['mid', '가맹점 mid', 'O', 'String'],
                ['withdraw_amount', '출금금액', 'O', 'Integer'],
                ['withdraw_bank_code', '출금은행코드', 'O', 'String'],
                ['withdraw_acct_num', '출금계좌번호', 'O', 'String'],
                ['withdraw_acct_name', '출금예금주명', 'O', 'String'],
                ['deposit_acct_name', '입금자명', 'X', 'String'],
                ['pay_type', '출금타입 (withdraw=정산, return=회원들에게 출금 기본값 withdraw)', 'X', 'String'],
                ['note', '메모사항', 'X', 'String'],
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
    }
    return {
        tab_list,
        table_obj,
        tab_key: 'withdrawv1'
    }
}
export default WithdrawApiV1;