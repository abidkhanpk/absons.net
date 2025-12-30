/**
 * Returns Dynamic Generated CSS
 */

import generateCSS from "../../../../generateCSS";
import generateCSSUnit from "../../../../generateCSSUnit";

function EditorStyles(props) {
  const {
    icon_color,
    label_color,
    icon_hover_color,
    label_hover_color,
    icon_bg_color,
    icon_bg_hover_color,
    icon_border_color,
    icon_border_hover_color,
    block_id,
    blockTopMargin,
    blockBottomMargin,
    blockLeftMargin,
    blockRightMargin,
    blockTopMarginTablet,
    blockBottomMarginTablet,
    blockLeftMarginTablet,
    blockRightMarginTablet,
    blockTopMarginMobile,
    blockBottomMarginMobile,
    blockLeftMarginMobile,
    blockRightMarginMobile,
    blockTopPadding,
    blockTopPaddingMobile,
    blockTopPaddingTablet,
    blockBottomPadding,
    blockBottomPaddingMobile,
    blockBottomPaddingTablet,
    blockLeftPadding,
    blockLeftPaddingMobile,
    blockLeftPaddingTablet,
    blockRightPadding,
    blockRightPaddingMobile,
    blockRightPaddingTablet,
    blockIsMarginControlConnected,
    blockIsPaddingControlConnected,
  } = props.attributes;

  var selectors = {
    " .responsive-block-editor-addons-icon-list__content-wrap .responsive-block-editor-addons-icon-list__source-icon": {
      color: icon_color,
    },
    ":hover .responsive-block-editor-addons-icon-list__content-wrap .responsive-block-editor-addons-icon-list__source-icon": {
      color: icon_hover_color,
    },
    " .responsive-block-editor-addons-icon-list__content-wrap .responsive-block-editor-addons-icon-list__source-wrap": {
      "background-color": icon_bg_color,
      "border-color": icon_border_color,
    },
    ":hover .responsive-block-editor-addons-icon-list__content-wrap .responsive-block-editor-addons-icon-list__source-wrap": {
      "background-color": icon_bg_hover_color,
      "border-color": icon_border_hover_color,
    },
    " .responsive-block-editor-addons-icon-list__content-wrap .responsive-block-editor-addons-icon-list__source-icon svg": {
      fill: icon_color,
    },
    ":hover .responsive-block-editor-addons-icon-list__content-wrap .responsive-block-editor-addons-icon-list__source-icon svg": {
      fill: icon_hover_color,
    },
    " .responsive-block-editor-addons-icon-list__content-wrap .responsive-block-editor-addons-icon-list__label": {
      color: label_color,
    },
    ":hover .responsive-block-editor-addons-icon-list__content-wrap .responsive-block-editor-addons-icon-list__label": {
      color: label_hover_color,
    },
    " .block-editor-block-list__layout .block-editor-block-list__block": {
      "padding-top": generateCSSUnit(blockTopPadding, "px"),
      "padding-right": generateCSSUnit(blockRightPadding, "px"),
      "padding-bottom": generateCSSUnit(blockBottomPadding, "px"),
      "padding-left": generateCSSUnit(blockLeftPadding, "px"),
      "margin-top": generateCSSUnit(blockTopMargin, "px"),
      "margin-right": generateCSSUnit(blockRightMargin, "px"),
      "margin-bottom": generateCSSUnit(blockBottomMargin, "px"),
      "margin-left": generateCSSUnit(blockLeftMargin, "px"),
    }
  };

  var mobile_selectors = {
    " .block-editor-block-list__layout .block-editor-block-list__block": {
      "padding-top": generateCSSUnit(blockTopPaddingMobile, "px"),
      "padding-right": generateCSSUnit(blockRightPaddingMobile, "px"),
      "padding-bottom": generateCSSUnit(blockBottomPaddingMobile, "px"),
      "padding-left": generateCSSUnit(blockLeftPaddingMobile, "px"),
      "margin-top": generateCSSUnit(blockTopMarginMobile, "px"),
      "margin-right": generateCSSUnit(blockRightMarginMobile, "px"),
      "margin-bottom": generateCSSUnit(blockBottomMarginMobile, "px"),
      "margin-left": generateCSSUnit(blockLeftMarginMobile, "px"),
    }
  };

  var tablet_selectors = {
    " .block-editor-block-list__layout .block-editor-block-list__block": {
      "padding-top": generateCSSUnit(blockTopPaddingTablet, "px"),
      "padding-right": generateCSSUnit(blockRightPaddingTablet, "px"),
      "padding-bottom": generateCSSUnit(blockBottomPaddingTablet, "px"),
      "padding-left": generateCSSUnit(blockLeftPaddingTablet, "px"),
      "margin-top": generateCSSUnit(blockTopMarginTablet, "px"),
      "margin-right": generateCSSUnit(blockRightMarginTablet, "px"),
      "margin-bottom": generateCSSUnit(blockBottomMarginTablet, "px"),
      "margin-left": generateCSSUnit(blockLeftMarginTablet, "px"),
    }
  };

  var styling_css = "";
  var id = `.responsive-block-editor-addons-icon-list-repeater.responsive-block-editor-addons-${block_id}`;

  styling_css = generateCSS(selectors, id);
  styling_css += generateCSS(tablet_selectors, id, true, "tablet");
  styling_css += generateCSS(mobile_selectors, id, true, "mobile");

  return styling_css;
}

export default EditorStyles;
