import { select } from '../settings.js';
import { utils } from '../utils.js';
import BaseWidget from './BaseWidget.js';

class HourPicker extends BaseWidget{
  constructor(wrapperElement, initialValue){
    super(wrapperElement, initialValue); // arg1 - referencja do kontenera widgetu; arg2 - godzina otwarcia
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.input); // referencja do inputu, na którym działa plugin "rangeSlider"
    thisWidget.dom.output = thisWidget.dom.wrapper.querySelector(select.widgets.hourPicker.output); // referencja do outputu, który wyświetla godziny
    thisWidget.initPlugin(); // uruchomienie pluginu
    super.setValue(initialValue); // ustawienie godziny dla pierwszego załadowania strony
  }

  initPlugin(){
    const thisWidget = this;
    // eslint-disable-next-line no-undef
    rangeSlider.create(thisWidget.dom.input);
    thisWidget.dom.input.addEventListener('input', function(){
      thisWidget.value = thisWidget.dom.input.value; // (!) zaaktualizowanie godziny poprzez bezpośrednie uruchomienie settera
    });
  }

  parseValue(value){ // wyłączenie lub nadpisanie oryginalnych metod z "BaseWidget"
    return utils.numberToHour(value);
  }

  isValid(){
    return true;
  }

  renderValue(){
    const thisWidget = this;
    thisWidget.dom.output.innerHTML = thisWidget.value; // wyświetlenie godziny na stronie
  }
}

export default HourPicker;
