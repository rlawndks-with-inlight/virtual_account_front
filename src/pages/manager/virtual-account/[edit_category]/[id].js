import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import dynamic from "next/dynamic";
import { apiManager, apiServer } from "src/utils/api-manager";
import { bankCodeList, virtualAccountUserTypeList } from "src/utils/format";
import { useAuthContext } from "src/auth/useAuthContext";
import _ from "lodash";
import VirtualAccountBankners from "src/views/virtual-account/bankners";
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

const VirtualAccountEdit = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const { themeMode, themeDnsData } = useSettingsContext();

  return (
    <>
      {themeDnsData?.deposit_corp_type == 1 &&
        <>
          <VirtualAccountBankners />
        </>}

    </>
  )
}
VirtualAccountEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default VirtualAccountEdit
