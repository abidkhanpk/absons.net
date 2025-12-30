import { __ } from '@wordpress/i18n';
import { useState, Fragment } from '@wordpress/element';

const RbeaImageSizeTabControl = ({ label, value, onChange, options, defaultValue = '' }) => {

    // Store the currently selected option in state
  if(defaultValue === '')
    {
      defaultValue = options[0].value;
    }
    const [activeOption, setActiveOption] = useState(value);
  
    // Handle the option change
    const handleChange = (value) => {
      setActiveOption(value); // Update the active option
      onChange(value); // Trigger the onChange handler
    };

  return (
    <Fragment>
      <div className="rbea-image-size-control-wrapper">
        <label>{label}</label>
        <div className="rbea-image-size-options .components-flex">
          {options.map((option) => (
            <div className='rbea-image-size-option'>
                <div
                  key={option.value}
                  className={`${option.value} ${
                    activeOption === option.value ? 'is-active' : ''
                  }`}
                  onClick={() => handleChange(option.value)}
                >
                  {option.size ? option.size : option.label}
                </div>
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
};

export default RbeaImageSizeTabControl;
