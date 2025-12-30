/**
 * Box-Shadow reusable component.
 *
 */
const { __ } = wp.i18n;

const { ColorPalette } = wp.blockEditor;

const { SelectControl, RangeControl, TabPanel, Dashicon } = wp.components;

import RbeaRangeControl from "../../utils/components/rbea-range-control";
import RbeaTabRadioControl from "../../utils/components/rbea-tab-radio-control";
import imageShapeIcons from "../../blocks/testimonial/components/image-shape-icons";
import imageSizeIcons from "../../blocks/testimonial/components/image-size-icons";
import RbeaImageSizeTabControl from "../../utils/components/rbea-image-size-tab-control";

// Extend component
const { Component, Fragment } = wp.element;

class ImageSettingsControl extends Component {
  constructor() {
    super(...arguments);
  }

  render() {
      const {
          attributes: {
              imageShape,
              imageSize,
              imageWidth,
              imageWidthTablet,
              imageWidthMobile
          },
          setAttributes,
      } = this.props;

      const imageShapeOptions = [
          {
              value: "circle",
              label: __("Circle", "responsive-block-editor-addons"),
              shortName: __("Circle", "responsive-block-editor-addons"),
              icon: imageShapeIcons.circle,
          },
          {
              value: "square",
              label: __("Square", "responsive-block-editor-addons"),
              shortName: __("Square", "responsive-block-editor-addons"),
              icon: imageShapeIcons.square,
          },
          {
              value: "blob",
              label: __("Blob", "responsive-block-editor-addons"),
              shortName: __("Blob", "responsive-block-editor-addons"),
              icon: imageShapeIcons.blob
          },
      ];
    
    let options = [
        { 
            value: "thumbnail", 
            label: __("Thumbnail From New Control", "responsive-block-editor-addons"),
            size: imageSizeIcons.thumbnail,
        },
        { 
            value: "medium", 
            label: __("Medium From New Control", "responsive-block-editor-addons"),
            size: imageSizeIcons.medium,
        },
        { 
            value: "large", 
            label: __("Large From New Control", "responsive-block-editor-addons"),
            size: imageSizeIcons.large,
        },
        { 
            value: "full-size", 
            label: __("Full Size From New Control", "responsive-block-editor-addons"),
            size: imageSizeIcons.fullsize,
        },
    ];
    var advancedControls;
      advancedControls = (
          <Fragment>
              <RbeaTabRadioControl
                  label={__("Shape", "responsive-block-editor-addons")}
                  value={imageShape}
                  options={imageShapeOptions}
                  onChange={(newImageShape) =>
                      setAttributes({ imageShape: newImageShape })
                  }
                  hasIcon={true}
              />
              <RbeaImageSizeTabControl
                  label={__("Size", "responsive-block-editor-addons")}
                  value={imageSize}
                  options={options}
                  onChange={(newImageSize) =>
                      setAttributes({ imageSize: newImageSize })
                  }
              />

              <TabPanel
                  className=" responsive-size-type-field-tabs  responsive-size-type-field__common-tabs  responsive-inline-margin"
                  activeClass="active-tab"
                  tabs={[
                      {
                          name: "desktop",
                          title: <Dashicon icon="desktop" />,
                          className:
                              " responsive-desktop-tab  responsive-responsive-tabs",
                      },
                      {
                          name: "tablet",
                          title: <Dashicon icon="tablet" />,
                          className: " responsive-tablet-tab  responsive-responsive-tabs",
                      },
                      {
                          name: "mobile",
                          title: <Dashicon icon="smartphone" />,
                          className: " responsive-mobile-tab  responsive-responsive-tabs",
                      },
                  ]}
              >
                  {(tab) => {
                      let tabout;

                      if ("mobile" === tab.name) {
                          tabout = (
                              <Fragment>
                                  <RbeaRangeControl
                                      label={__("Width Mobile", "responsive-block-editor-addons")}
                                      value={imageWidthMobile}
                                      onChange={(value) =>
                                          this.props.setAttributes({
                                              imageWidthMobile: value,
                                          })
                                      }
                                      min={0}
                                      max={500}
                                      step={1}
                                  />
                              </Fragment>
                          );
                      } else if ("tablet" === tab.name) {
                          tabout = (
                              <Fragment>
                                  <RbeaRangeControl
                                      label={__("Width Tablet", "responsive-block-editor-addons")}
                                      value={imageWidthTablet}
                                      onChange={(value) =>
                                          this.props.setAttributes({
                                              imageWidthTablet: value,
                                          })
                                      }
                                      min={0}
                                      max={500}
                                      step={1}
                                  />
                              </Fragment>
                          );
                      } else {
                          tabout = (
                              <Fragment>
                                  <RbeaRangeControl
                                      label={__("Width", "responsive-block-editor-addons")}
                                      value={imageWidth}
                                      onChange={(value) =>
                                          this.props.setAttributes({
                                              imageWidth: value,
                                          })
                                      }
                                      min={0}
                                      max={500}
                                      step={1}
                                  />
                              </Fragment>
                          );
                      }
                      return <div>{tabout}</div>;
                  }}
              </TabPanel>
    </Fragment>
      );


    return (
      <div className="responsive-block-editor-addons-block-border-settings">
        {advancedControls}
      </div>
    );
  }
}

export default ImageSettingsControl;
