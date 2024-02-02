import { settings, select } from '../settings.js'; // (!) ścieżka do importowanego pliku (../settings.js) jest zawsze relatywna do pliku, w którym się dokonuje importowania (./components/AmountWidget.js)
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget { // klasa pochodna "AmountWidget" (widget - element interfejsu graficznego) - nadaje życie inputowi i buttonom liczbowym, tak aby informowały o swoim działaniu inne elementy
  constructor(wrapperElement, initialValue){ // arg1 - referencja do kontenera widgetu; arg2 - początkowa wartość w input
    super(wrapperElement, initialValue); // (!) wywołanie metody w cely zainicjalizowania konstruktora w klasie nadrzędnej "BaseWidget"
    const thisWidget = this;

    thisWidget.getElements(); // odnalezienie elementów znajdujących się w kontenerze widgetu
    thisWidget.initActions(); // dodanie reakcji na eventy dla input oraz buttonów "+" i "-"
    super.setValue(initialValue); // (!) ustawienie wartości w input dla pierwszego załadowania strony; odwołanie się do metody z klasy nadrzędnej
  }

  getElements(){
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input); // pole obiektu "thisWidget.dom.wrapper" jest dziedziczone z klasy "BaseWidget"
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }

  isValid(value){ // (!) nadpisuje metodę z klasy nadrzędnej "BaseWidget"
    return (!isNaN(value) && value <= settings.amountWidget.defaultMax && value >= settings.amountWidget.defaultMin);
  }

  renderValue(){ // (!) nadpisuje metodę z klasy nadrzędnej "BaseWidget"
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value; // aktualizowanie wartości dla właściwości "value" w input
  }

  initActions(){
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.dom.input.value); // (!) parametr metody nadpisuje wywołanie gettera
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
}

export default AmountWidget;