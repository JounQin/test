import { Page } from "./pages";

export const App = () => {
  return <Page page={() => import("./pages/Test")} cacheKey="test" />;
};
