import { Routes, Route } from "react-router-dom";
import FunctionSettings from "../FunctionSetting/FunctionSettings";
import DeviceTab from "../Device/DeviceTab";
import TagName from "../TagName/TagName";
import HistoricalTab from "../Historical/HistoricalTab";
import Configuration from "../Configuration/configurationTab";

const AppRoutes = (props) => {
    return (
        <Routes>

            <Route path="/" element={<div>Home</div>} />

            <Route path="/login" element={<div>Login</div>} />

            <Route path="/historical" element={<HistoricalTab />} />

            <Route path="/configuration" element={<Configuration />} />

            <Route path="/device" element={<DeviceTab />} />

            <Route path="/tagname" element={<TagName />} />

            <Route path="/funcSettings" element={<FunctionSettings />} />

            <Route path="*" element={<div>404 Not Found!!</div>} />
        </Routes>
    )
}

export default AppRoutes;