/**
 * Box-Shadow reusable component.
 *
 */
const { __ } = wp.i18n;

const { ColorPalette } = wp.blockEditor;

const { SelectControl, RangeControl } = wp.components;

// Extend component
const { Component, Fragment } = wp.element;
import RbeaColorControl from "../../../utils/components/rbea-color-control";

class ColorBackgroundControl extends Component {
  constructor() {
    super(...arguments);
  }

  render() {
      const {
          attributes: {
              backgroundColor
          },
          setAttributes,
      } = this.props;


    var advancedControls;
      advancedControls = (
        <Fragment>
          <RbeaColorControl
            label = {__("Background Color", "responsive-block-editor-addons")}
            colorValue={backgroundColor}
            onChange={(colorValue) => setAttributes({ backgroundColor: colorValue })}
            resetColor={() => setAttributes({ backgroundColor: "" })}
          />

        </Fragment>
      );


    return (
      <div className="responsive-block-editor-addons-color-background-settings">
        {advancedControls}
      </div>
    );
  }
}

export default ColorBackgroundControl;
