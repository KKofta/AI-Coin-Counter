import React from 'react';
import {Navbar} from "reactstrap";

const NavigationBar = () => {
    return (
        <Navbar dark container="fluid" style={{backgroundColor: "#50A"}}>
            <div className="col-12 text-center">
                <h3 className="text-light">AI COIN COUNTER</h3>
            </div>
        </Navbar>
    );
}

export default NavigationBar;