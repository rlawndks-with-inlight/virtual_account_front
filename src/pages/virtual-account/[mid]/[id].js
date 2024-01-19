import { useSettingsContext } from "src/components/settings";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import { apiServer } from "src/utils/api-manager";
import { bankCodeList, virtualAccountUserTypeList } from "src/utils/format";
import BlankLayout from "src/layouts/BlankLayout";
import VirtualAccountBankners from "src/views/virtual-account/bankners";
import VirtualAccountPaytus from "src/views/virtual-account/paytus";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const VirtualAccountAddNoneAuth = () => {
    const { setModal } = useModal()
    const { themeDnsData } = useSettingsContext();

    console.log(themeDnsData)
    return (
        <>
            {themeDnsData?.deposit_corp_type == 1 &&
                <>
                    <VirtualAccountBankners />
                </>}
            {themeDnsData?.deposit_corp_type == 3 &&
                <>
                    <VirtualAccountPaytus />
                </>}
        </>
    )
}
VirtualAccountAddNoneAuth.getLayout = (page) => <BlankLayout>{page}</BlankLayout>;
export default VirtualAccountAddNoneAuth;