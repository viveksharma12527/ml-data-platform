// import { Navigate } from "react-router-dom";


export const AdminRoute = ({ children }) => {
    // if (!decodedToken) {
    //     alert("You are not logged in.");
    //     return <Navigate to="/login" replace />;
    // }

    // if (decodedToken.role !== "admin") {
    //     alert("You are not an admin");
    //     return <Navigate to="/unauthorized" replace />;
    // }
    return children;
};

export const DataSpecialistRoute = ({ children }) => {
    // if (!decodedToken) {
    //     alert("You are not logged in.");
    //     return <Navigate to="/login" replace />;
    // }

    // if (decodedToken.role !== "data-specialist") {
    //     alert("You are not an data-specialist.");
    //     return <Navigate to="/unauthorized" replace />;
    // }
    return children;
};

export const AnnotatorRoute = ({ children }) => {
    // if (!decodedToken) {
    //     alert("You are not logged in.");
    //     return <Navigate to="/login" replace />;
    // }

    // if (decodedToken.role !== "annotator") {
    //     alert("You are not an annotator.");
    //     return <Navigate to="/unauthorized" replace />;
    // }
    return children;
};

export const UserRoute = ({ children }) => {
    // if (!isLoggedIn) {
    //     alert("You are not logged in.");
    //     return <Navigate to="/login" replace />;
    // }

    return children;
};

export const GuestRoute = ({ children }) => {
    // if (isLoggedIn) {
    //     alert("You are already logged in.");
    //     return <Navigate to="/" replace />;
    // }

    return children;
};