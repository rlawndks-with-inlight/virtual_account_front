
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import dynamic from "next/dynamic";
import ApiDocs from "../api-docs";

const VirtualAccountApi = () => {

    return (
        <>
            <ApiDocs />
        </>
    )
}
VirtualAccountApi.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default VirtualAccountApi
