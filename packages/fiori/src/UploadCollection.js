import UI5Element from "@ui5/webcomponents-base/dist/UI5Element.js";
import litRender from "@ui5/webcomponents-base/dist/renderer/LitRenderer.js";
import { getI18nBundle } from "@ui5/webcomponents-base/dist/i18nBundle.js";
import Icon from "@ui5/webcomponents/dist/Icon.js";
import Label from "@ui5/webcomponents/dist/Label.js";
import List from "@ui5/webcomponents/dist/List.js";
import ListMode from "@ui5/webcomponents/dist/types/ListMode.js";
import Title from "@ui5/webcomponents/dist/Title.js";
import "@ui5/webcomponents-icons/dist/upload-to-cloud.js";
import "@ui5/webcomponents-icons/dist/document.js";
import {
	UPLOADCOLLECTION_NO_DATA_TEXT,
	UPLOADCOLLECTION_NO_DATA_DESCRIPTION,
	UPLOADCOLLECTION_DRAG_FILE_INDICATOR,
	UPLOADCOLLECTION_DROP_FILE_INDICATOR,
	UPLOADCOLLECTION_ARIA_ROLE_DESCRIPTION,
} from "./generated/i18n/i18n-defaults.js";
import {
	attachBodyDnDHandler,
	detachBodyDnDHandler,
	draggingFiles,
} from "./upload-utils/UploadCollectionBodyDnD.js";
import UploadCollectionDnDOverlayMode from "./types/UploadCollectionDnDMode.js";

// Template
import UploadCollectionTemplate from "./generated/templates/UploadCollectionTemplate.lit.js";

// Styles
import UploadCollectionCss from "./generated/themes/UploadCollection.css.js";

/**
 * @public
 */
const metadata = {
	tag: "ui5-upload-collection",
	languageAware: true,
	properties: /** @lends sap.ui.webcomponents.fiori.UploadCollection.prototype */ {
		/**
		 * Defines the mode of the <code>ui5-upload-collection</code>.
		 *
		 * <br><br>
		 * <b>Note:</b>
		 * <ul>
		 * <li><code>None</code></li>
		 * <li><code>SingleSelect</code></li>
		 * <li><code>MultiSelect</code></li>
		 * <li><code>Delete</code></li>
		 * </ul>
		 *
		 * @type {ListMode}
		 * @defaultvalue "None"
		 * @public
		 */
		mode: {
			type: ListMode,
			defaultValue: ListMode.None,
		},

		/**
		 * Allows you to set your own text for the 'No data' description.
		 *
		 * @type {string}
		 * @defaultvalue ""
		 * @public
		 */
		noDataDescription: {
			type: String,
		},

		/**
		 * Allows you to set your own text for the 'No data' text.
		 *
		 * @type {string}
		 * @defaultvalue ""
		 * @public
		 */
		noDataText: {
			type: String,
		},

		/**
		 * By default there will be drag and drop overlay shown over the <code>ui5-upload-collection</code> when files
		 * are dragged. If you don't intend to use drag and drop, set this property.
		 * <br><br>
		 * <b>Note:</b> It is up to the application developer to add handler for <code>drop</code> event and handle it.
		 * <code>ui5-upload-collection</code> only displays an overlay.
		 *
		 * @type {boolean}
		 * @defaultvalue false
		 * @public
		 */
		hideDragOverlay: {
			type: Boolean,
		},

		/**
		 * Indicates what overlay to show when files are being dragged.
		 *
		 * @type {UploadCollectionDnDOverlayMode}
		 * @defaultvalue "None"
		 * @private
		 */
		_dndOverlayMode: {
			type: String,
			defaultValue: UploadCollectionDnDOverlayMode.None,
		},

		/**
		 * Defines the accessible ARIA name of the component.
		 *
		 * @type {string}
		 * @defaultvalue ""
		 * @public
		 * @since 1.0.0-rc.16
		 */
		accessibleName: {
			type: String,
		},
	},
	managedSlots: true,
	slots: /** @lends sap.ui.webcomponents.fiori.UploadCollection.prototype */ {
		/**
		 * Defines the items of the <code>ui5-upload-collection</code>.
		 * <br><b>Note:</b> Use <code>ui5-upload-collection-item</code> for the intended design.
		 *
		 * @type {sap.ui.webcomponents.fiori.IUploadCollectionItem[]}
		 * @slot items
		 * @public
		 */
		"default": {
			propertyName: "items",
			type: HTMLElement,
		},

		/**
		 * Defines the <code>ui5-upload-collection</code> header.
		 * <br><br>
		 * <b>Note:</b> If <code>header</code> slot is provided,
		 * the labelling of the <code>UploadCollection</code> is a responsibility of the application developer.
		 * <code>accessibleName</code> should be used.
		 *
		 * @type {HTMLElement[]}
		 * @slot
		 * @public
		 */
		header: {
			type: HTMLElement,
		},
	},
	events: /** @lends sap.ui.webcomponents.fiori.UploadCollection.prototype */ {
		/**
		 * Fired when an element is dropped inside the drag and drop overlay.
		 * <br><br>
		 * <b>Note:</b> The <code>drop</code> event is fired only when elements are dropped within the drag and drop overlay and ignored for the other parts of the <code>ui5-upload-collection</code>.
		 *
		 * @event sap.ui.webcomponents.fiori.UploadCollection#drop
		 * @readonly
		 * @param {DataTransfer} dataTransfer The <code>drop</code> event operation data.
		 * @public
		 * @native
		 */
		drop: {},

		/**
		 * Fired when the Delete button of any item is pressed.
		 * <br><br>
		 * <b>Note:</b> A Delete button is displayed on each item,
		 * when the <code>ui5-upload-collection</code> <code>mode</code> property is set to <code>Delete</code>.
		 * @event sap.ui.webcomponents.fiori.UploadCollection#item-delete
		 * @param {HTMLElement} item The <code>ui5-upload-collection-item</code> which was renamed.
		 * @public
		 */
		"item-delete": {
			detail: {
				item: { type: HTMLElement },
			},
		},

		/**
		 * Fired when selection is changed by user interaction
		 * in <code>SingleSelect</code> and <code>MultiSelect</code> modes.
		 *
		 * @event sap.ui.webcomponents.fiori.UploadCollection#selection-change
		 * @param {Array} selectedItems An array of the selected items.
		 * @public
		 */
		"selection-change": {
			detail: {
				selectedItems: { type: Array },
			},
		},
	},
};

/**
 * @class
 *
 * <h3 class="comment-api-title">Overview</h3>
 * This component allows you to represent files before uploading them to a server, with the help of <code>ui5-upload-collection-item</code>.
 * It also allows you to show already uploaded files.
 *
 * <h3>ES6 Module Import</h3>
 * <code>import "@ui5/webcomponents-fiori/dist/UploadCollection.js";</code>
 * <br>
 * <code>import "@ui5/webcomponents-fiori/dist/UploadCollectionItem.js";</code> (for <code>ui5-upload-collection-item</code>)
 *
 * @constructor
 * @author SAP SE
 * @alias sap.ui.webcomponents.fiori.UploadCollection
 * @extends UI5Element
 * @tagname ui5-upload-collection
 * @appenddocs UploadCollectionItem
 * @public
 * @since 1.0.0-rc.7
 */
class UploadCollection extends UI5Element {
	static get metadata() {
		return metadata;
	}

	static get render() {
		return litRender;
	}

	static get styles() {
		return UploadCollectionCss;
	}

	static get template() {
		return UploadCollectionTemplate;
	}

	static get dependencies() {
		return [
			Icon,
			Label,
			List,
			Title,
		];
	}

	static async onDefine() {
		UploadCollection.i18nBundle = await getI18nBundle("@ui5/webcomponents-fiori");
	}

	constructor() {
		super();
		this._bodyDnDHandler = event => {
			if (this._dndOverlayMode !== UploadCollectionDnDOverlayMode.Drop) {
				this._dndOverlayMode = event.mode;
			}
		};
	}

	onEnterDOM() {
		if (this.hideDragOverlay) {
			return;
		}

		attachBodyDnDHandler(this._bodyDnDHandler);
	}

	onExitDOM() {
		if (this.hideDragOverlay) {
			return;
		}

		detachBodyDnDHandler(this._bodyDnDHandler);
	}

	_ondragenter(event) {
		if (this.hideDragOverlay) {
			return;
		}

		if (!draggingFiles(event)) {
			return;
		}

		this._dndOverlayMode = UploadCollectionDnDOverlayMode.Drop;
	}

	_ondrop(event) {
		if (this.hideDragOverlay) {
			return;
		}

		if (event.target !== this.shadowRoot.querySelector(".uc-dnd-overlay")) {
			event.stopPropagation();
		}

		this._dndOverlayMode = UploadCollectionDnDOverlayMode.None;
	}

	_ondragover(event) {
		if (this.hideDragOverlay) {
			return;
		}

		event.preventDefault();
	}

	_ondragleave() {
		if (this.hideDragOverlay) {
			return;
		}

		this._dndOverlayMode = UploadCollectionDnDOverlayMode.Drag;
	}

	_onItemDelete(event) {
		this.fireEvent("item-delete", { item: event.detail.item });
	}

	_onSelectionChange(event) {
		this.fireEvent("selection-change", { selectedItems: event.detail.selectedItems });
	}

	get classes() {
		return {
			content: {
				"ui5-uc-content": true,
				"ui5-uc-content-no-data": this.items.length === 0,
			},
			dndOverlay: {
				"uc-dnd-overlay": true,
				"uc-drag-overlay": this._dndOverlayMode === UploadCollectionDnDOverlayMode.Drag,
				"uc-drop-overlay": this._dndOverlayMode === UploadCollectionDnDOverlayMode.Drop,
			},
			noFiles: {
				"uc-no-files": true,
				"uc-no-files-dnd-overlay": this._showDndOverlay,
			},
		};
	}

	get _root() {
		return this.shadowRoot.querySelector(".ui5-uc-root");
	}

	get _dndOverlay() {
		return this._root.querySelector(".uc-dnd-overlay");
	}

	get _showDndOverlay() {
		return this._dndOverlayMode !== UploadCollectionDnDOverlayMode.None;
	}

	get _showNoData() {
		return this.items.length === 0;
	}

	get _noDataText() {
		return this.noDataText || UploadCollection.i18nBundle.getText(UPLOADCOLLECTION_NO_DATA_TEXT);
	}

	get _noDataDescription() {
		return this.noDataDescription || UploadCollection.i18nBundle.getText(UPLOADCOLLECTION_NO_DATA_DESCRIPTION);
	}

	get _roleDescription() {
		return UploadCollection.i18nBundle.getText(UPLOADCOLLECTION_ARIA_ROLE_DESCRIPTION);
	}

	get _dndOverlayText() {
		if (this._dndOverlayMode === UploadCollectionDnDOverlayMode.Drag) {
			return UploadCollection.i18nBundle.getText(UPLOADCOLLECTION_DRAG_FILE_INDICATOR);
		}

		return UploadCollection.i18nBundle.getText(UPLOADCOLLECTION_DROP_FILE_INDICATOR);
	}
}

UploadCollection.define();

export default UploadCollection;
