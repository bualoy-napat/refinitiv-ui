import { elementUpdated, expect, nextFrame } from '@refinitiv-ui/test-helpers';

/**
 * Cross browser function to wait while select element becomes opened/closed and resized
 * @param {TreeSelect} el Tree select
 * @returns {Promise<void>}
 */
export const openedUpdated = async (el) => {
  await elementUpdated(el);
  await nextFrame();
};

/**
 * @param {TreeSelect} el tree select
 * @param {[]} toChange Array of item references for selection change
 * @param {boolean} [uncheck] Uncheck items, default is to select
 * @returns {[]} Set of values that were selected
 */
export const changeItemSelection = (el, toChange, uncheck) => {
  const treeManager = el.treeManager;
  // toChange is an array of references to the original items
  toChange.forEach((item) => {
    if (uncheck) {
      treeManager.uncheckItem(item);
    } else {
      treeManager.checkItem(item);
    }
  });
  el.updateMemo();
  return toChange.map((item) => item.value);
};

/**
 * Check the element's memo
 * @param {TreeSelect} el Tree select instance to check
 * @param {{expandable: number, expanded: number, selectable: number, selected: number}} expected Expected memo
 */
export const checkMemo = (el, expected) => {
  expect(el.memo.expandable).to.equal(expected.expandable, 'memo.expandable is incorrect');
  expect(el.memo.expanded).to.equal(expected.expanded, 'memo.expanded is incorrect');
  expect(el.memo.selectable).to.equal(expected.selectable, 'memo.selectable is incorrect');
  expect(el.memo.selected).to.equal(expected.selected, 'memo.selected is incorrect');
};

/**
 * extract ef-icon element displaying the icon from ef-tree-item element
 * @param {TreeItem} treeItemEl ef-tree-item element
 * @returns {Icon} ef-icon element
 */
export const getIconPart = (treeItemEl) => treeItemEl.shadowRoot.querySelector('[part="label-icon"]');

/**
 * extract ef-tree element displaying data in tree structure from ef-tree-select element
 * @param {TreeSelect} treeSelectEl ef-tree-select element
 * @returns {Tree} ef-tree element
 */
export const getTreeElPart = (treeSelectEl) => treeSelectEl.shadowRoot.querySelector('[part="tree"]');

/**
 * extract label text content from ef-tree-item element
 * @param {TreeItem} treeItemEl
 * @returns {string} label content
 */
export const getLabelContent = (treeItemEl) => {
  const labelPart = treeItemEl.shadowRoot.querySelector('[part="label"]');
  return labelPart.children[0].textContent;
};
