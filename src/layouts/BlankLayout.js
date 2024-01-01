import { useSettingsContext } from "src/components/settings";

const BlankLayout = (props) => {

    const { children } = props;

    const { themeDnsData } = useSettingsContext();
    if (themeDnsData?.id > 0) {
        return (
            <>
                {children}
            </>
        )
    } else {
        return <>
        </>
    }

}
export default BlankLayout;