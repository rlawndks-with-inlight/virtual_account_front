import { useSettingsContext } from "src/components/settings";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import BlankLayout from "src/layouts/BlankLayout";
import { Row } from "src/components/elements/styled-components";
import GiftCardBankners from "src/views/gift-card/bankners";

const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const GiftCardAddNoneAuth = () => {
    const { setModal } = useModal()
    const { themeDnsData } = useSettingsContext();
    return (
        <>
            <Row style={{ minHeight: '100vh' }}>
                <div style={{ margin: '2rem auto auto auto', width: '90%', maxWidth: '1000px' }}>
                    {themeDnsData?.deposit_corp_type == 1 &&
                        <>
                            <GiftCardBankners />
                        </>}
                </div>
            </Row>

        </>
    )
}
GiftCardAddNoneAuth.getLayout = (page) => <BlankLayout>{page}</BlankLayout>;
export default GiftCardAddNoneAuth;