import { Button, Result } from "antd";
import { memoize } from "lodash";
import type { ComponentType, ReactElement } from "react";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { Loading } from "../components";

export interface LazyPage {
  default: ComponentType;
}

// we're not using `useMemo` because `lazy` will wrapper LazyComponent every time even for same page
export const lazyComponent = memoize(
  (page: () => Promise<LazyPage>, _cacheKey: string) => lazy(() => page()),
  (page, cacheKey) => cacheKey || page
);

export interface DynamicPageProps {
  cacheKey: string;
  page: () => Promise<LazyPage>;
}

export function Page({ page, cacheKey }: DynamicPageProps): ReactElement {
  const Component = lazyComponent(page, cacheKey);
  return (
    <Suspense fallback={<Loading />}>
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <Result
            status="warning"
            title={error.message}
            extra={
              <Button type="primary" onClick={resetErrorBoundary}>
                {"retry"}
              </Button>
            }
          >
            {error.stack}
          </Result>
        )}
      >
        <Component />
      </ErrorBoundary>
    </Suspense>
  );
}
