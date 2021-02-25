import React, {lazy} from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";

function Router() {
    return (
        <React.Suspense fallback={'Loading...'}>
            <BrowserRouter>
                <Switch>
                    <Route exact path="/chat" component={lazy(()=>import("./components/ChatScreen"))} />
                    <Route path="/" component={lazy(()=>import("./components/WelcomeScreen"))} />
                </Switch>
            </BrowserRouter>
        </React.Suspense>
    );
}

export default Router;