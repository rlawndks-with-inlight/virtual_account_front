import { useSettingsContext } from "src/components/settings";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import BlankLayout from "src/layouts/BlankLayout";
import VirtualAccountBankners from "src/views/virtual-account/bankners";
import VirtualAccountPaytus from "src/views/virtual-account/paytus";
import { Row } from "src/components/elements/styled-components";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const VirtualAccountAddNoneAuth = () => {
    const { setModal } = useModal()
    const { themeDnsData } = useSettingsContext();

    return (
        <>
            <Row style={{ minHeight: '100vh' }}>
                <div style={{ margin: 'auto', width: '90%', maxWidth: '1000px' }}>
                    {themeDnsData?.deposit_corp_type == 1 &&
                        <>
                            <VirtualAccountBankners />
                        </>}
                    {themeDnsData?.deposit_corp_type == 3 &&
                        <>
                            <VirtualAccountPaytus />
                        </>}
                </div>
            </Row>

        </>
    )
}
VirtualAccountAddNoneAuth.getLayout = (page) => <BlankLayout>{page}</BlankLayout>;
export default VirtualAccountAddNoneAuth;