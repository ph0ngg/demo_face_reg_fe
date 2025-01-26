import React, { useState } from "react";
import AddPerson from "./components/AddPerson";
import DeletePerson from "./components/DeletePerson";
import WebcamStream from "./components/WebcamStream";

const App = () => {
    const [activeComponent, setActiveComponent] = useState("");

    const handleButtonClick = (componentName) => {
        setActiveComponent(componentName);
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h1>Face Recognition App</h1>

            {/* 3 buttons cho 3 chức năng */}
            <div>
                <button onClick={() => handleButtonClick("addPerson")}>Add Person</button>
                <button onClick={() => handleButtonClick("deletePerson")}>Delete Person</button>
                <button onClick={() => handleButtonClick("webcamStream")}>Webcam Stream</button>
            </div>

            {/* Hiển thị component tương ứng khi nhấn button */}
            <div>
                {activeComponent === "addPerson" && <AddPerson />}
                {activeComponent === "deletePerson" && <DeletePerson />}
                {activeComponent === "webcamStream" && <WebcamStream />}
            </div>
        </div>
    );
};

export default App;