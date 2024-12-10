import { commarNumber } from "src/utils/function";
import styled from "styled-components";
import { useSettingsContext } from "../settings";

const GaugeBarContainer = styled.div`
position: relative;
  width: 84px;
  height: 40px;
  background-color: #444;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
`
const GaugeBarFill = styled.div`
 height: 100%;
  transition: width 0.3s ease-in-out;
`
const GaugeBarText = styled.div`
position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 1px 2px #444;
`
const GaugeBar = ({ current, total }) => {
    const { themeDnsData } = useSettingsContext();
    const percentage = Math.min((current / total) * 100, 100);

    return (
        <GaugeBarContainer>
            <GaugeBarFill
                style={{ width: `${percentage}%`, backgroundColor: themeDnsData?.theme_css?.main_color }}
            ></GaugeBarFill>
            <GaugeBarText>
                {commarNumber(current)}<br />
                /{commarNumber(total)}
            </GaugeBarText>
        </GaugeBarContainer>
    );
};

export default GaugeBar;