import {
  BasicElement,
  css,
  CSSResult,
  customElement,
  html,
  property,
  PropertyValues,
  TemplateResult
} from '@refinitiv-ui/core';
import '../header';
import '../panel';
import '../icon';

/**
 * Allows users to hide non-critical information
 * or areas of the screen, maximizing the amount of real estate
 * for their primary displays.
 *
 * @slot header-left - Slot to add custom contents to the left side of header e.g. ef-icon, ef-checkbox
 * @slot header-right - Slot to add custom contents to the right side of header e.g. ef-icon, ef-checkbox
 *
 */
@customElement('ef-collapse', {
  alias: 'coral-collapse'
})
export class Collapse extends BasicElement {
  /**
   * A `CSSResult` that will be used
   * to style the host, slotted children
   * and the internal template of the element.
   * @return CSS template
   */
  static get styles (): CSSResult | CSSResult[] {
    return css`
       :host {
        display: block;
      }
      [part="header"] {
        cursor: default;
      }
      [part="toggle"] {
        display: inline-block;
        margin: 0 5px;
      }
      [part="content"]  {
        overflow: hidden;
        box-sizing: border-box;
      }
      [no-animation] {
        animation: none !important;
      }
    `;
  }

  private panelHolder: HTMLElement | null = null;
  private panel: HTMLElement | null = null;

  /**
   * Set text on the header
   */
  @property({ type: String }) header: string | null = null;

  /**
   * Use level styling from theme
   */
  @property({ type: String }) level = '3';

  /**
   * Set to expand the item
   */
  @property({ type: Boolean, reflect: true }) expanded = false;

  /**
   * Set to apply padding from theme to content section
   */
  @property({ type: Boolean }) spacing = false;

  /**
   * @param changedProperties {PropertyValues}
   * @return {void}
   */
  protected firstUpdated (changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);

    this.panelHolder = this.shadowRoot && this.shadowRoot.querySelector('[part="content"]');
    this.panel = this.shadowRoot && this.shadowRoot.querySelector('ef-panel');
    this.panelHolder && this.panelHolder.setAttribute('no-animation', '');
  }

  /**
   * @param changedProperties {PropertyValues}
   * @return {void}
   */
  protected updated (changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('expanded')) {
      this.showHide();
    }
  }

  /**
   * A `TemplateResult` that will be used
   * to render the updated internal template.
   * @return Render template
   */
  protected render (): TemplateResult {
    return html`
      <ef-header part="header" level="${this.level}" @tap="${this.handleTap}">
        <ef-icon icon="right" slot="left" part="toggle"></ef-icon>
        <slot slot="left" name="header-left"></slot>
        <slot slot="right" name="header-right"></slot>
        ${this.header}
      </ef-header>

      <div part="content">
        <ef-panel ?spacing="${this.spacing}" transparent>
          <slot></slot>
        </ef-panel>
      </div>
    `;
  }

  /**
   * Toggle the item
   * @returns void
   */
  private toggle (): void {
    this.expanded = !this.expanded;
    /* @fires expanded-changed
       * Fired when the `expanded` property changes.
       */
    this.dispatchEvent(new CustomEvent('expanded-changed', {
      detail: { value: this.expanded },
      cancelable: true
    }));
  }

  /**
   * only handle clicks from ef-header/toggle part, not ef-header content
   * @param element for checking
   * @returns boolean
   */

  private static isHeader (element: HTMLElement): boolean {
    return element.localName === 'ef-header' || element.getAttribute('part') === 'toggle';
  }

  /**
   * Handle tap on the item header, will toggle the expanded state
   * @param e - Event object
   * @returns void
   */
  private handleTap = (e: Event): void => {
    const target = e.target as HTMLElement;

    if (Collapse.isHeader(target)) {
      this.toggle();
    }
  };

  /**
   * Show or Hide the item depending on the expanded state
   * @returns void
   */
  private showHide (): void {
    if (!this.panelHolder) {
      return;
    }
    this.panelHolder.removeAttribute(('no-animation'));
    this.setAnimationTargetHeight(this.getContentHeight());
  }

  /**
   * Set current content height at the target-height
   * @param height number or null value
   * @returns void
   */
  private setAnimationTargetHeight (height: number): void {
    this.updateVariable('--target-height', height + 'px');
  }

  /**
   * Gets the height of the ef-panel element which contains the content
   * will pass height including optional spacing
   * @returns clientHeight of the panel so that the panel holder max-height can be set
   */
  private getContentHeight (): number {
    return this.panel && this.panel.clientHeight || 0;
  }
}
