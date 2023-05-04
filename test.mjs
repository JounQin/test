// @ts-check

import fs from 'node:fs/promises';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { visit } from 'unist-util-visit';

const contents = await fs.readFile('./test.mdx', 'utf8');

const processor = unified().use(remarkParse).use(remarkMdx);

const root = processor.parse(contents);

visit(root, node => {
  if (node.type !== 'mdxJsxFlowElement') {
    return;
  }

  const value = node.attributes[0].value;

  console.log(value);

  if (value && typeof value === 'object') {
    const estree = value.data?.estree;
    if (estree?.range) {
      const [start, end] = estree.range;
      console.log('start:', start, 'end:', end); // expect `start: 16 end: 20` here
      console.log(JSON.stringify(contents[start]));
      console.log(JSON.stringify(contents[end])); // expect "`" here
      console.log(JSON.stringify(contents[20]));
    }
  }
});
