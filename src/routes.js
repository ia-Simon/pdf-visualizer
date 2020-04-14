import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import PdfGetter from './pages/PdfGetter';

export default function Routes() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path='/' exact component={PdfGetter}/>
            </Switch>
        </BrowserRouter>
    );
}