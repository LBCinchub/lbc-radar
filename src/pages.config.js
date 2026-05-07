import Home from './pages/Home';
import BuilderIntelligence from './pages/BuilderIntelligence';
import __Layout from './Layout.jsx';

export const PAGES = {
    "Home": Home,
    "BuilderIntelligence": BuilderIntelligence,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};
