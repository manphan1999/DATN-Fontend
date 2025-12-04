import SideBar from '../SideBar/SideBar';
import './Root.scss';
// import { FaBars } from 'react-icons/fa';
import { useState } from "react";

const Root = (props) => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="admin-container">
            {/* <div className="admin-sidebar">
                <SideBar collapsed={collapsed} />
                <FaBars onClick={() => setCollapsed(!collapsed)} /> q
            </div>
            <div className="admin-content">

                content goes here
            </div> */}
        </div>
    )
}
export default Root;