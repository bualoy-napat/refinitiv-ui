import '@refinitiv-ui/elements/overlay';

import '@refinitiv-ui/elemental-theme/light/ef-overlay';
import { elementUpdated, expect, isFirefox, isNear, nextFrame } from '@refinitiv-ui/test-helpers';

import {
  createPositionTargetFixture,
  expectMatchExactAlignWord,
  expectMatchExactPositionWord,
  getPossibleOffsets,
  getSizes,
  heightSizes,
  initPossiblePositions,
  matchExact,
  matchExactAlignWord,
  matchExactPositionWord,
  matchExactSize,
  openedUpdated,
  possiblePositions,
  targetHeightEqualToPanelHeight,
  targetWidthEqualToPanelWidth,
  widthSizes
} from './mocks/helper.js';

initPossiblePositions();

const screenWidth = document.documentElement.clientWidth;
const screenHeight = document.documentElement.clientHeight;

const screenCenter = { left: screenWidth / 2, top: screenHeight / 2 };

describe('overlay/PositionTarget', function () {
  describe(`Test Positions (screen width: ${screenWidth}, height: ${screenHeight})`, function () {
    describe('Test with position target in center without fallback', function () {
      /* eslint-disable mocha/no-setup-in-describe */
      for (let widthSize of widthSizes) {
        for (let heightSize of heightSizes) {
          describe(`Test ${widthSize} and ${heightSize}`, function () {
            const { targetSize } = getSizes(widthSize, heightSize);

            const x = screenCenter.left - targetSize.width / 2;
            const y = screenCenter.top - targetSize.height / 2;

            for (let possiblePosition of possiblePositions) {
              it(`Test position ${possiblePosition}`, async function () {
                const { target, panel } = await createPositionTargetFixture(
                  x,
                  y,
                  possiblePosition,
                  widthSize,
                  heightSize
                );

                const matchExactResult = matchExact(target, panel, possiblePosition);
                expect(matchExactResult).to.equal('', matchExactResult);

                const matchExactSizeResult = matchExactSize(target, panel, widthSize, heightSize);
                expect(matchExactSizeResult).to.equal('', matchExactSizeResult);
              });
            }
          });
        }
      }
      /* eslint-enable mocha/no-setup-in-describe */
    });

    describe('Test with position target in center with fallback', function () {
      /* eslint-disable mocha/no-setup-in-describe */
      for (let widthSize of widthSizes) {
        for (let heightSize of heightSizes) {
          describe(`Test ${widthSize} and ${heightSize}`, function () {
            const { targetSize } = getSizes(widthSize, heightSize);

            const x = screenCenter.left - targetSize.width / 2;
            const y = screenCenter.top - targetSize.height / 2;

            for (let possiblePosition of possiblePositions) {
              it(`Test position ${possiblePosition}`, async function () {
                const fallbackPosition = 'top-middle';
                const { target, panel } = await createPositionTargetFixture(
                  x,
                  y,
                  `${possiblePosition}, ${fallbackPosition}`,
                  widthSize,
                  heightSize
                );

                const matchExactResult = matchExact(target, panel, possiblePosition);
                expect(matchExactResult).to.equal('', matchExactResult);

                const matchExactSizeResult = matchExactSize(target, panel, widthSize, heightSize);
                expect(matchExactSizeResult).to.equal('', matchExactSizeResult);
              });
            }
          });
        }
      }
      /* eslint-enable mocha/no-setup-in-describe */
    });

    describe('Test with position target x and y offsets', function () {
      /* eslint-disable mocha/no-setup-in-describe */
      before(function () {
        isFirefox() && this.skip(); // Firefox has the page navigated interruption issue on BrowserStack
      });
      for (let widthSize of widthSizes) {
        for (let heightSize of heightSizes) {
          describe(`Test ${widthSize} and ${heightSize}`, function () {
            const { xOffsets, yOffsets } = getPossibleOffsets(widthSize, heightSize);

            const { targetSize, panelSize } = getSizes(widthSize, heightSize);

            for (let possiblePosition of possiblePositions) {
              describe(`Test Position ${possiblePosition}`, function () {
                for (let xOffset of xOffsets) {
                  for (let yOffset of yOffsets) {
                    it(`Test offset x: ${xOffset} y: ${yOffset}`, async function () {
                      const { target, panel } = await createPositionTargetFixture(
                        xOffset,
                        yOffset,
                        possiblePosition,
                        widthSize,
                        heightSize,
                        false
                      );
                      target.style.top = `${yOffset}px`;
                      target.style.left = `${xOffset}px`;

                      panel.opened = true;

                      await elementUpdated(panel);

                      /**
                       * Calling `nextFrame()` on BrowserStack's Firefox would trigger page navigation.
                       * This break the test with "Tests were interrupted because the page navigated to ..." error.
                       * This describe block skips on Firefox due to this issue.
                       */
                      await nextFrame();

                      const matchExactPositionWordResult = matchExactPositionWord(
                        target,
                        panel,
                        possiblePosition
                      );

                      if (
                        expectMatchExactPositionWord(
                          xOffset,
                          yOffset,
                          targetSize,
                          panelSize,
                          possiblePosition
                        )
                      ) {
                        expect(matchExactPositionWordResult).to.equal('', matchExactPositionWordResult);
                      } else {
                        expect(matchExactPositionWordResult).to.not.equal(
                          '',
                          `Panel should not have correct position word: x ${xOffset} y ${yOffset}`
                        );
                      }

                      const matchExactAlignWordResult = matchExactAlignWord(target, panel, possiblePosition);

                      if (
                        expectMatchExactAlignWord(xOffset, yOffset, targetSize, panelSize, possiblePosition)
                      ) {
                        expect(matchExactAlignWordResult).to.equal('', matchExactAlignWordResult);
                      } else {
                        expect(matchExactAlignWordResult).to.not.equal(
                          '',
                          `Panel should not have correct position align word: x ${xOffset} y ${yOffset}`
                        );
                      }
                    });
                  }
                }
              });
            }
          });
        }
      }
      /* eslint-enable mocha/no-setup-in-describe */
    });

    describe('Overlap', function () {
      const borderOffset = 20;
      const alignOffset = 200;

      let width;
      let height;

      before(function () {
        const { targetSize } = getSizes(targetWidthEqualToPanelWidth, targetHeightEqualToPanelHeight);
        width = targetSize.width;
        height = targetSize.height;
      });

      it('Test top-middle', async function () {
        const { target, panel } = await createPositionTargetFixture(
          alignOffset,
          borderOffset,
          'top-middle',
          targetWidthEqualToPanelWidth,
          targetHeightEqualToPanelHeight
        );
        panel.style.minHeight = `${height}px`;

        await openedUpdated(panel);

        panel.noOverlap = true;

        await openedUpdated(panel);

        const panelRect = panel.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        expect(panelRect.bottom).to.equal(targetRect.top);
        expect(panelRect.height).to.equal(borderOffset);
        expect(panel.style.minHeight).to.equal(`${borderOffset}px`);
        expect(panel.style.maxHeight).to.equal(`${borderOffset}px`);
      });

      it('Test bottom-middle', async function () {
        const { target, panel } = await createPositionTargetFixture(
          alignOffset,
          screenHeight - height - borderOffset,
          'bottom-middle',
          targetWidthEqualToPanelWidth,
          targetHeightEqualToPanelHeight
        );

        await openedUpdated(panel);

        panel.noOverlap = true;

        await openedUpdated(panel);

        const panelRect = panel.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        // https://issues.chromium.org/issues/40811956
        // As getBoundingClientRect() could return fractional values,
        // less than 1 pixel difference is considered equal.
        expect(isNear(panelRect.top, targetRect.bottom, 1, false)).to.equal(true);
        expect(isNear(panelRect.height, borderOffset, 1)).to.equal(true);
      });

      it('Test left-middle', async function () {
        const { target, panel } = await createPositionTargetFixture(
          borderOffset,
          alignOffset,
          'left-middle',
          targetWidthEqualToPanelWidth,
          targetHeightEqualToPanelHeight
        );
        panel.style.minWidth = `${width}px`;

        await openedUpdated(panel);

        panel.noOverlap = true;

        await openedUpdated(panel);

        const panelRect = panel.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        expect(panelRect.right).to.equal(targetRect.left);
        expect(panelRect.width).to.equal(borderOffset);
        expect(panel.style.minWidth).to.equal(`${borderOffset}px`);
        expect(panel.style.maxWidth).to.equal(`${borderOffset}px`);
      });

      it('Test right-middle', async function () {
        const { target, panel } = await createPositionTargetFixture(
          screenWidth - width - borderOffset,
          alignOffset,
          'right-middle',
          targetWidthEqualToPanelWidth,
          targetHeightEqualToPanelHeight
        );

        await openedUpdated(panel);

        panel.noOverlap = true;

        await openedUpdated(panel);

        const panelRect = panel.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();

        expect(panelRect.left).to.equal(targetRect.right);
        expect(panelRect.width).to.equal(borderOffset);
      });
    });

    describe('Outside View', function () {
      let width;
      let height;

      before(function () {
        const { targetSize } = getSizes(targetWidthEqualToPanelWidth, targetHeightEqualToPanelHeight);
        width = targetSize.width;
        height = targetSize.height;
      });

      it('Test outside view bottom-start', async function () {
        const { panel } = await createPositionTargetFixture(
          screenWidth / 2 - width / 2,
          screenHeight + 1,
          'bottom-start',
          targetWidthEqualToPanelWidth,
          targetHeightEqualToPanelHeight
        );

        await openedUpdated(panel);
        const rect = panel.getBoundingClientRect();

        expect(isNear(rect.bottom, screenHeight, 1)).to.equal(true);
      });

      it('Test outside view top-start', async function () {
        const { panel } = await createPositionTargetFixture(
          screenWidth / 2 - width / 2,
          -height - 1,
          'top-start',
          targetWidthEqualToPanelWidth,
          targetHeightEqualToPanelHeight
        );

        await openedUpdated(panel);
        const rect = panel.getBoundingClientRect();

        expect(rect.top).to.equal(0);
      });

      it('Test outside view left-start', async function () {
        const { panel } = await createPositionTargetFixture(
          -width - 1,
          screenHeight / 2 - height / 2,
          'left-start',
          targetWidthEqualToPanelWidth,
          targetHeightEqualToPanelHeight
        );

        await openedUpdated(panel);
        const rect = panel.getBoundingClientRect();

        expect(rect.left).to.equal(0);
      });

      it('Test outside view right-start', async function () {
        const { panel } = await createPositionTargetFixture(
          screenWidth + width + 1,
          screenHeight / 2 - height / 2,
          'right-start',
          targetWidthEqualToPanelWidth,
          targetHeightEqualToPanelHeight
        );

        await openedUpdated(panel);
        const rect = panel.getBoundingClientRect();

        expect(rect.right).to.equal(screenWidth);
      });
    });
  });
});
