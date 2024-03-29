import React, {useEffect} from "react";

import { useRouteError, useNavigate } from "react-router-dom";

const ErrorPage = ({redirectPath}) => {
    const navigate = useNavigate()
    useEffect(() => {
        if (redirectPath !== undefined) {
            navigate(redirectPath)
        }
    })

    const error = useRouteError();

    return (
        <div id="error-page" className="row" style={{ textAlign: "center", marginTop: 40 }}>
            <h1>That's puzzling... 🤔</h1>
            <p>An unexpected error has occurred.</p>
            <p>
                <i>{error && (error.statusText || error.message)}</i>
            </p>
        </div>
    );
}

export default ErrorPage;