import {
  css,
  customElement,
  property,
  CSSResult,
  PropertyValues,
  ResponsiveElement,
  TemplateResult,
  ElementSize,
  html,
  query
} from '@refinitiv-ui/core';

import 'browser-sparkline';
import type { BrowserSparklineChart } from 'browser-sparkline';
import type { StaticDataConfig, ThemeConfig } from 'browser-sparkline/lib/browserSparklineCanvas';

import { helpers } from './helpers';
export { helpers };

@customElement('ef-sparkline', {
  alias: 'sapphire-sparkline'
})
export class Sparkline extends ResponsiveElement {
  /**
   * Chart data as an array of number.
   */
  @property({ type: Array })
  public data: number[] = [];

  /**
   * Chart previous data as an array of number.
   */
  @property({ attribute: 'previous-data', type: Array })
  public previousData = [];

  /**
   * Baseline value to show horizontal line (optional)
   */
  @property({ attribute: 'reference-value', type: Number })
  public referenceValue?: number;

  /**
   * Chart width
   */
  protected width?: number;

  /**
   * Chart height
   */
  protected height?: number;

  /**
   * Chart initialize status
   */
  protected initialized = false;

  /**
   * Get canvas element from shadow roots
   */
  @query('browser-sparkline-chart')
  protected chart!: BrowserSparklineChart;

  /**
   * Get configuration for theme
   */
  protected get defaultThemeConfig (): Partial<ThemeConfig> {
    return {
      width: this.width,
      height: this.height,
      lineColor: helpers.colorToHex(this.getComputedVariable('--line-color', '#ff9933')),
      lineWidth: parseInt(this.getComputedVariable('--line-width', '2px'), 10),
      referenceLineColor: helpers.colorToHex(this.getComputedVariable('--reference-line-color', 'rgba(120, 120, 130, 0.5)')),
      previousLineColor: helpers.colorToHex(this.getComputedVariable('--previous-line-color', '#bfbfbf')),
      upperLineColor: helpers.colorToHex(this.getComputedVariable('--upper-line-color', '#309054')),
      lowerLineColor: helpers.colorToHex(this.getComputedVariable('--lower-line-color', '#d94255')),
      fillColorStyle: this.getComputedVariable('--fill-color-style', 'gradient')
    };
  }

  /**
   * Get configuration for static data
   */
  private get staticDataConfig (): StaticDataConfig {
    return {
      previousData: this.previousData,
      data: this.data,
      referenceValue: this.referenceValue
    };
  }

  /**
   * On Connected Callback Lifecycle
   * @ignore
   * @return {void}
   */
  public connectedCallback (): void {
    super.connectedCallback();
    this.createChart();
  }

  /**
   * On Updated Lifecycle
   * @ignore
   * @param changedProperties changed properties
   * @return {void}
   */
  protected updated (changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.get('data')) {
      this.dataChanged();
    }
    this.createChart();
  }

  /**
   * Handles when data was changed.
   * Fires event `data-changed` by default but will fires event `data-error` if giving data a wrong format
   * @returns {void}
   */
  private dataChanged (): void {
    if (!this.data || this.data.length < 2) {
      /* @fires data-error
       * Fired when data has error and chart cannot be updated
       */
      this.dispatchEvent(new CustomEvent('data-error'));
      return;
    }

    /**
     * Fired when data is changed
     * @fires data-changed
     */
    this.dispatchEvent(new CustomEvent('data-changed'));
  }

  /**
   * Re-draw canvas when the size of component changed
   * @ignore
   * @param size element dimensions
   * @returns {void}
   */
  public resizedCallback (size: ElementSize): void {
    this.width = size.width;
    this.height = size.height;

    if (this.initialized) {
      this.chart.style.width = `${this.width}px`;
      this.chart.style.height = `${this.height}px`;
      this.chart.updateCanvasSize(this.width, this.height);
    }
    else {
      this.initialized = true;
      this.createChart();
    }
  }

  /**
   * Create chart
   * @protected
   * @returns {void}
   */
  protected createChart (): void {
    if (!this.isConnected || !this.initialized || !this.data || this.data.length < 2) {
      return;
    }

    this.chart.config = {
      themeConfig: this.defaultThemeConfig,
      staticData: this.staticDataConfig
    };
  }

  /**
   * A `CSSResult` that will be used
   * to style the host, slotted children
   * and the internal template of the element.
   * @return CSS template
   */
  static get styles (): CSSResult {
    return css`
      :host {
        width: 100px;
        height: 50px;
        display: block;
      }

      browser-sparkline-chart, browser-sparkline-canvas {
        width: 100%;
        height: 100%;
        display: block;
      }

      [part=chart] {
        height: 100%;
      }
    `;
  }

  /**
   * A `TemplateResult` that will be used
   * to render the updated internal template.
   * @return Render template
   */
  protected render (): TemplateResult {
    return html`
      <browser-sparkline-chart part="chart" id="sparkline"></browser-sparkline-chart>
    `;
  }
}
