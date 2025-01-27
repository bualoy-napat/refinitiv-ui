<!--
title: Tree Node
location: ./custom-components/utils/tree-node
type: page
layout: default
language_tabs: [javascript, typescript]
-->

# Tree Node

Tree Node provides an easy way to programmatically manipulate items in [Tree](/elements/tree) & [Tree Select](/elements/tree-select). Simply read or update item properties in the same manner with how one would do so on an object. It works in conjunction with [Tree Manager](/custom-components/utils/tree-manager).

```javascript
// Select all items with icon in Tree
const tree = document.querySelector('ef-tree');
tree.data = [
  { label: 'one', value: '1' },
  { label: 'two', value: '2', icon: 'info' },
  { label: 'three', value: '3', selected: true },
  { label: 'four', value: '4', icon: 'clock' }
];
console.log(tree.values); // Expected output: ['3']

const treeNodes = tree.manager.getTreeNodes();
const targetNodes = treeNodes.filter(treeNode => treeNode.icon);
targetNodes.forEach(node => {
  node.selected = true;
});
console.log(tree.values); // Expected output: ['3','2','4']
```

```typescript
import type { Tree } from '@refinitiv-ui/elements/tree';

// Select all items with icon in Tree
const tree = document.querySelector<Tree>('ef-tree')!;
tree.data = [
  { label: 'one', value: '1' },
  { label: 'two', value: '2', icon: 'info' },
  { label: 'three', value: '3', selected: true },
  { label: 'four', value: '4', icon: 'clock' }
];
console.log(tree.values); // Expected output: ['3']

const treeNodes = tree.manager.getTreeNodes();
const targetNodes = treeNodes.filter(treeNode => treeNode.icon);
targetNodes.forEach(node => {
  node.selected = true;
});
console.log(tree.values); // Expected output: ['3','2','4']
```
