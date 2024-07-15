import { useSettingsContext } from "src/components/settings";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import BlankLayout from "src/layouts/BlankLayout";
import VirtualAccountBankners from "src/views/virtual-account/bankners";
import VirtualAccountPaytus from "src/views/virtual-account/paytus";
import { Row } from "src/components/elements/styled-components";
import VirtualAccountCoocon from "src/views/virtual-account/coocon";
import VirtualAccountKoreaPaySystem from "src/views/virtual-account/korea-pay-system";
import VirtualAccountIcb from "src/views/virtual-account/icb";

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
                <div style={{ margin: '2rem auto auto auto', width: '90%', maxWidth: '1000px' }}>
                    {themeDnsData?.deposit_corp_type == 1 &&
                        <>
                            <VirtualAccountBankners />
                        </>}
                    {themeDnsData?.deposit_corp_type == 2 &&
                        <>
                            <VirtualAccountCoocon />
                        </>}
                    {themeDnsData?.deposit_corp_type == 3 &&
                        <>
                            <VirtualAccountPaytus />
                        </>}
                    {themeDnsData?.deposit_corp_type == 6 &&
                        <>
                            <VirtualAccountKoreaPaySystem />
                        </>}
                    {themeDnsData?.deposit_corp_type == 7 &&
                        <>
                            <VirtualAccountIcb />
                        </>}
                </div>
            </Row>

        </>
    )
}
VirtualAccountAddNoneAuth.getLayout = (page) => <BlankLayout>{page}</BlankLayout>;
export default VirtualAccountAddNoneAuth;