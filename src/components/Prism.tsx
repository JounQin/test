import { Alert, Skeleton } from "antd";
import prism from "prismjs";
import type { FC } from "react";

import { Rehype } from "./Rehype";

import { usePromise } from "../hooks";

export interface PrismProps {
  theme?: string;
  lang: string;
  children?: string;
}

export const Prism: FC<PrismProps> = ({
  children,
  theme = "dracula",
  lang,
}) => {
  const [data, error] = usePromise(() =>
    Promise.all([
      Promise.any([
        import(
          `../../../node_modules/prismjs/themes/prism-${theme}.css`
        ) as Promise<unknown>,
        import(
          `../../../node_modules/prism-themes/themes/prism-${theme}.css`
        ) as Promise<unknown>,
      ]),
      import(
        `../../../node_modules/prismjs/components/prism-${
          lang === "js" ? "javascript" : lang
        }.min.js`
      ) as Promise<unknown>,
    ])
  );
  return data && children ? (
    <pre className={`prism mb-0 language-${lang}`}>
      <Rehype>{prism.highlight(children, prism.languages[lang], lang)}</Rehype>
    </pre>
  ) : error ? (
    <>
      <Alert
        type="error"
        showIcon
        message={`Unknown theme "${theme}" or language "${lang}"`}
      ></Alert>
      <pre>{children}</pre>
    </>
  ) : (
    <Skeleton />
  );
};

export default Prism;
