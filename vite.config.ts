import reactRefresh from "@vitejs/plugin-react-refresh";
import { defineConfig } from "vite";
import reactJsx from "vite-react-jsx";
import styleImport from "vite-plugin-style-import";

export default defineConfig({
  plugins: [
    reactJsx(),
    reactRefresh(),
    styleImport({
      libs: [
        {
          libraryName: "antd",
          esModule: true,
          resolveStyle: (name) => `antd/es/${name}/style/index`,
        },
      ],
    }),
  ],
  server: {
    open: true,
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          const [first, second] = id
            .split(/[/\\]node_modules[/\\]/)[1]
            .split(/[/\\]/);

          const pkg = first.startsWith("@") ? `${first}/${second}` : first;

          if (
            /^(mdast|micromark|hast(script)?|rehype|remark|unified|unist)\b/.test(
              pkg
            )
          ) {
            return "unified";
          }

          if (/^(@ant-|antd|rc-)\b/.test(pkg)) {
            return "antd";
          }

          console.log(pkg);

          if (pkg.includes("prism")) {
            return;
          }

          return "vendors";
        },
      },
    },
  },
});
